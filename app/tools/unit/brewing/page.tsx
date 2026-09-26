import Link from 'next/link'
import BrewingClient from './BrewingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'
import { convertAll, abvSimple, abvCorrected, abvFromBrix } from './brewingData'

export const metadata = buildMetadata({
  path: '/tools/unit/brewing',
  title: '양조 도수·당도 변환기 — Brix·Plato·SG·Baumé·Oechsle + ABV',
  description:
    'Brix·Plato·SG·Baumé·Oechsle 5종 동시 환산 + OG/FG 기반 ABV 계산 + Proof 변환. 자가양조·홈와인·잼·치즈 메이커용. pH/TA 참고 가이드 포함.',
  keywords: [
    'Brix SG 변환', 'Plato SG', '비중 환산', 'Brix 계산',
    '자가양조', '홈브루잉', 'ABV 계산기', 'OG FG',
    '와인 머스트', 'Baumé 보메', 'Oechsle 왹슬레',
    '잼 당도', '치즈 pH', 'TA 산도',
    'Proof ABV 변환', 'US Proof', 'UK Proof',
    '굴절계', '비중계', '발효 측정',
  ],
})

/* ── 가이드 표 — 계산기와 같은 brewingData 식으로 빌드 시 생성 ── */
const REF_BRIX = [0, 5, 10, 12, 15, 18, 20, 22, 24, 26, 30]
const REF_ROWS = REF_BRIX.map(b => {
  const c = convertAll('brix', b)
  const w = abvFromBrix(b)
  return { brix: b, sg: c.sg, baume: c.baume, oechsle: c.oechsle, abvLow: w.low, abvHigh: w.high }
})
const ABV_PAIRS: { og: number; fg: number; ex: string }[] = [
  { og: 1.040, fg: 1.010, ex: '라이트 라거' },
  { og: 1.050, fg: 1.010, ex: '페일 에일' },
  { og: 1.060, fg: 1.012, ex: 'IPA' },
  { og: 1.080, fg: 1.015, ex: '임페리얼 스타우트' },
  { og: 1.090, fg: 1.000, ex: '드라이 화이트 와인' },
  { og: 1.100, fg: 0.995, ex: '드라이 레드 와인' },
  { og: 1.120, fg: 1.010, ex: '미드(꿀술)' },
]
const ABV_ROWS = ABV_PAIRS.map(p => {
  const simple = abvSimple(p.og, p.fg)
  const corr = abvCorrected(p.og, p.fg)
  return { ...p, simple, corr, gap: corr - simple }
})
const f3 = (n: number) => n.toFixed(3)
const f1 = (n: number) => n.toFixed(1)

const FAQ_LD = [
              {
                q: 'Brix와 Plato는 정확히 같은가요?',
                a: '<strong>실용적으로는 같습니다</strong>(차이 < 0.05°). Brix는 식품 업계에서 자당 100%를 기준으로, Plato는 양조 업계에서 맥주 워트의 추출당을 기준으로 정의된 약간 다른 정의지만, 동일한 농도의 동일한 시료는 거의 같은 값이 나옵니다. 양조 카탈로그는 Plato로 표기하고 식품 카탈로그는 Brix로 표기할 뿐입니다.',
              },
              {
                q: '굴절계로 발효 후 Brix를 재면 왜 부정확한가요?',
                a: '굴절계는 <strong>빛의 굴절률로 당도를 추정</strong>합니다. 발효 후 시료에는 알코올이 들어있는데, 알코올은 굴절률을 자체적으로 올려서 마치 당이 더 있는 것처럼 측정됩니다. 정확한 발효 후 Brix는 <strong>알코올 보정식</strong>(Sean Terrill 공식 등)으로 변환하거나, <strong>비중계로 SG 직접 측정</strong>이 권장됩니다. 본 도구의 OG/FG 입력에 SG를 쓰세요.',
              },
              {
                q: 'OG·FG 입력 시 SG로만 받는 이유는?',
                a: 'SG는 알코올 유무와 관계없이 정확하고, ABV 공식이 SG 기준이라 그렇습니다. Brix로 측정했다면 본 도구의 5종 환산표에서 Brix→SG 값을 확인해 입력하세요. 단, <strong>발효 후 Brix는 굴절계가 부정확</strong>하니 (위 Q2 참고) 비중계로 SG를 직접 재는 게 가장 정확합니다.',
              },
              {
                q: '와인 머스트 Brix 23은 ABV 몇 %로 발효되나요?',
                a: '대략 <strong>12.7~13.8% ABV</strong>로 발효됩니다(23 × 0.55~0.60 배수, 계산기 기본값 기준). 정확한 값은 효모의 알코올 내성·발효 온도·남기는 잔당(스위트로 멈출지 드라이까지 갈지)에 따라 ±1% 안팎 달라집니다. 이 계산기의 카테고리 가이드 기준으로 화이트는 19~22 Brix, 레드는 22~26 Brix, 25 Brix 이상은 디저트 와인 영역입니다.',
              },
              {
                q: 'pH와 TA(산도)는 왜 같이 측정하나요?',
                a: 'pH는 <strong>현재 산성의 강도</strong>를(로그 스케일), TA(Titratable Acidity)는 <strong>총 산의 농도</strong>를 측정합니다. 와인을 예로, 같은 pH 3.5라도 TA 6g/L와 9g/L는 전혀 다른 맛입니다 — 후자가 입에서 훨씬 시큼하게 느껴집니다. 반대로 미생물 안정성과 아황산(SO₂)의 효과는 주로 <strong>pH</strong>가 좌우합니다(pH가 낮을수록 같은 SO₂ 양으로 더 잘 보호됨). 둘 사이에 직접 변환 공식은 없으므로 <strong>두 값을 모두 측정·기록</strong>해야 발효 진행과 균형을 판단할 수 있습니다.',
              },
              {
                q: 'Oechsle와 Baumé 중 어느 게 더 정확한가요?',
                a: '<strong>정확도는 같습니다</strong>(둘 다 SG에서 단순 변환). 차이는 지역·전통: 독일·오스트리아·체코는 °Oe, 프랑스·이탈리아·스페인은 °Bé, 미국·영국·호주는 SG·Brix를 선호합니다. 본 도구는 5종 모두 동시 표시하므로 어느 지역 레시피든 바로 매칭 가능합니다.',
              },
              {
                q: 'US Proof와 UK Proof가 다른 이유는?',
                a: '<strong>US Proof = ABV × 2</strong>는 1848년 미국 정부가 정한 단순 단위. <strong>UK Proof</strong>는 1816년 기준으로 100°가 57.15% ABV에 해당하는 역사적 단위 — 정확히는 ABV ÷ 0.5715. UK는 1980년대부터 표기를 ABV로 통일했고, US도 라벨에는 ABV/Proof 둘 다 표기하는 경향. 본 도구의 UK Proof는 옛 위스키·럼 라벨 해독용 참고 정도로 보세요.',
              },
              {
                q: '잼은 왜 65 Brix↑이 필요한가요?',
                a: '<strong>당 함량 65%↑이 미생물 증식을 억제</strong>하는 임계선이기 때문(수분활성도 a<sub>w</sub> ≈ 0.85 이하). 60 Brix는 곰팡이 위험, 65 Brix는 대부분의 세균·일반 곰팡이·효모 억제, 70 Brix는 더 안전하지만 결정화·끈적임이 늘어납니다. 다만 당도만으로 ‘무균’이 되지는 않습니다 — 내건성 곰팡이·내삼투압 효모는 고당도에서도 자랄 수 있어 개봉 후 냉장 보관이 필요합니다. 시판 잼은 보통 65~68 Brix. 펙틴 농도와 끓이는 시간으로 조정하며, <strong>굴절계 측정이 가장 정확</strong>(스푼·시각 테스트는 ±5 Brix 오차).',
              },
            ]

export default function BrewingPage() {
  return (
    <ToolPage width={880} slug="/tools/unit/brewing">
      <h1 className="tp-h1">
        <ToolIconBadge catId="unit" />양조 도수·당도 변환기
      </h1>
      <p className="tp-lead">
        <strong style={{ color: 'var(--text)' }}>Brix·Plato·SG·Baumé·Oechsle</strong> 동시 환산 + ABV·Proof 계산. 자가양조·잼·과실주·치즈 메이커용.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis="ASBC 당도-비중 다항식·OIV 와인 단위 정의 기반 환산 · OG/FG 비중차 ABV 식 · 알코올 도수는 15°C 부피 백분율(주세법)"
        sources={[
          { label: 'ASBC Methods of Analysis', href: 'https://www.asbc.org/' },
          { label: 'OIV(국제포도·와인기구)', href: 'https://www.oiv.int/' },
          { label: '국가법령정보센터 — 주세법', href: 'https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A3%BC%EC%84%B8%EB%B2%95' },
          { label: 'eCFR 27 CFR 5.65(주류 도수 표시)', href: 'https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-5/subpart-E/section-5.65' },
        ]}
      />

      <BrewingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 5종 스케일 개요 */}
        <section>
          <h2 className="g-h2">5종 당도·비중 단위 — 언제 어떤 걸 쓰나</h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단위', '의미', '주 사용', '특이'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Brix (°Bx)',  '용액의 자당 % (중량)',          '식품·과실·시럽·잼·시판 음료',          '굴절계로 빠르게 측정. 식품 보존성 기준'],
                  ['Plato (°P)',  '맥주 워트 추출당 % (중량)',     '맥주 양조 (라거·에일·스타우트)',         'Brix와 거의 동일 — 양조 업계 관습'],
                  ['SG',          '비중 (물=1.000, 단위 없음)',     '가장 정확한 발효 추적',                  '발효 전후 모두 측정 → ABV 계산의 핵심'],
                  ['Baumé (°Bé)', '프랑스 전통 비중 (감미 척도)',   '와인 메이커, 디저트 와인',                '1°Bé ≈ 1.8°Bx. 와인 알코올 잠재량 표시'],
                  ['Oechsle (°Oe)','독일 와인 머스트 단위',          '독일·오스트리아 와인 등급 분류',          '°Oe = (SG−1)×1000. Kabinett·Spätlese 기준'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            다섯 단위는 결국 <strong>같은 액체의 밀도를 다르게 적은 것</strong>입니다. 이 계산기는 입력값을 모두 SG로 바꾼 뒤 나머지를 계산합니다 — Oechsle는 (SG−1)×1000, Baumé는 145×(1−1/SG)라는 정의식 그대로이고, Brix·Plato는 ASBC 자당 표를 근사한 3차 다항식으로 SG와 오갑니다. 그래서 Oechsle·Baumé 변환은 정의상 정확하고, Brix↔SG만 다항식 근사 오차(0~30°Bx에서 ±0.05° 수준)가 붙습니다.
          </p>
        </section>

        {/* 1b. 기준점 환산표 — 계산기와 같은 식 */}
        <section>
          <h2 className="g-h2">자주 쓰는 당도 기준점 환산표</h2>
          <p className="g-p">
            아래 값은 위 계산기와 같은 식으로 계산했습니다. 맥주 워트는 대개 10~18°Bx, 와인 머스트는 18~28°Bx 구간이라 양조 레시피에서 가장 자주 보는 범위만 추렸습니다. 마지막 열은 머스트 Brix만 알 때 쓰는 예상 도수(Brix × 0.55~0.60)입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Brix·Plato', 'SG', 'Baumé', 'Oechsle', '완전 발효 시 예상 ABV'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REF_ROWS.map((r, i) => (
                  <tr key={r.brix} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r.brix}°</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.sg.toFixed(4)}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.baume.toFixed(1)}°</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.oechsle.toFixed(0)}°</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r.brix === 0 ? '—' : `${f1(r.abvLow)}~${f1(r.abvHigh)}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            표를 읽는 요령: Baumé 값이 예상 도수와 거의 겹칩니다(22°Bx → 12.2°Bé → 약 12~13% ABV). 프랑스·남유럽 와인 양조에서 &lsquo;보메 1도 ≈ 잠재 알코올 1%&rsquo;로 머스트를 가늠하는 이유입니다. 반대로 SG 1.100을 넘는 고당도 머스트는 효모의 알코올 내성(와인 효모도 대개 14~18% 부근에서 멈춤) 때문에 끝까지 발효되지 않고 단맛이 남을 수 있어, 예상 ABV는 &lsquo;모두 발효됐을 때의 상한&rsquo;으로 보는 것이 맞습니다.
          </p>
        </section>

        {/* 2. ABV 계산 */}
        <section>
          <h2 className="g-h2">ABV 계산 — 발효 도수의 정확한 산출</h2>
          <p className="g-p">
            ABV(Alcohol By Volume)는 <strong style={{ color: 'var(--text)' }}>발효 전 비중(OG, Original Gravity)과 발효 후 비중(FG, Final Gravity)의 차이</strong>로 계산합니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                t: '단순 공식 (저알코올 ≤ 12%)',
                d: '<code style="color: var(--text)">ABV% = (OG − FG) × 131.25</code>',
                desc: '맥주·사이다처럼 OG가 낮은 경우에 충분. 131.25는 비중 1포인트(0.001) 감소가 대략 ABV 0.13%에 해당한다는 경험 계수라, OG가 높을수록 실제보다 낮게 나옵니다(아래 비교표).',
                c: 'var(--success)',
              },
              {
                t: '보정 공식 (고알코올 12%↑)',
                d: '<code style="color: var(--text)">ABV% = (76.08 × (OG−FG) / (1.775−OG)) × (FG / 0.794)</code>',
                desc: '와인·미드(꿀술)·고비중 맥주에 권장. 홈브루 계산기들이 ‘대체식(alternate formula)’으로 쓰는 경험식으로, 순수 에탄올의 비중(약 0.794)과 높은 OG에서의 비선형성을 반영합니다.',
                c: 'var(--cat-health)',
              },
              {
                t: '와인 머스트 Brix 기반 예측',
                d: '<code style="color: var(--text)">ABV% ≈ Brix × 0.55 ~ 0.60</code>',
                desc: '발효 전 머스트 Brix만 알 때 대략 예측. 효모 종류·잔당·온도에 따라 ±1% 차이.',
                c: 'var(--cat-art)',
              },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${m.c}`, borderRadius: 10, padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: m.c, fontWeight: 700, margin: '0 0 6px' }}>{m.t}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', margin: '0 0 6px', fontFamily: 'var(--font-sans)' }} dangerouslySetInnerHTML={{ __html: m.d }} />
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <h3 className="g-h3">두 식은 얼마나 차이 나나 — OG별 비교</h3>
          <p className="g-p">
            계산기 결과 카드에 두 값이 함께 나오는 이유입니다. 같은 OG·FG를 두 식에 넣은 값을 비교하면, 보통 맥주 구간에서는 거의 같다가 OG가 올라갈수록 벌어집니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['예시', 'OG', 'FG', '단순식', '보정식', '차이'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ABV_ROWS.map((r, i) => (
                  <tr key={r.og + '-' + r.fg} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{r.ex}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{f3(r.og)}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{f3(r.fg)}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.simple.toFixed(2)}%</td>
                    <td style={{ padding: '9px 12px', color: 'var(--accent-ink)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{r.corr.toFixed(2)}%</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>+{r.gap.toFixed(2)}%p</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            OG 1.050 페일 에일은 두 식의 차이가 {ABV_ROWS[1].gap.toFixed(2)}%p로 무시해도 되지만, OG 1.100 와인은 {ABV_ROWS[5].gap.toFixed(2)}%p, OG 1.120 미드는 {ABV_ROWS[6].gap.toFixed(2)}%p까지 벌어집니다. 도수를 라벨에 적거나 지인에게 나눌 술이라면 고비중에서는 보정식 값을 기준으로 삼으세요. 어느 식이든 OG·FG를 같은 온도 기준(아래 온도 보정)으로 읽어야 의미가 있습니다.
          </p>

          <h3 className="g-h3">ABV·ABW·도(度) — 표기 단위 헷갈리지 않기</h3>
          <p className="g-p">
            국내 주류의 &lsquo;도&rsquo;는 ABV와 같은 개념입니다. 주세법은 알코올분을 <strong>섭씨 15도에서 전체 용량 중 에틸알코올이 차지하는 부피 비율</strong>로 정하고, 알코올분 1도 이상인 음료를 주류로 봅니다. 반면 옛 미국 &lsquo;3.2 맥주&rsquo;처럼 무게 기준(ABW)으로 적힌 자료도 있는데, 에탄올이 물보다 가벼워 <strong>ABW ≈ ABV × 0.8</strong> 정도로 숫자가 작게 나옵니다(ABV 5% 맥주 ≈ ABW 4%). 외국 레시피의 도수가 유난히 낮아 보이면 ABW 표기인지 먼저 확인하세요.
          </p>
          <Callout tone="note" title="집에서 빚는 술과 주세법">
            판매하지 않고 스스로 마실 술을 집에서 빚는 것은 면허 없이 가능하지만, 판매하거나 대가를 받고 제공하려면 주세법에 따른 주류 제조 면허가 필요합니다. 제조 면허 요건·세율 같은 구체적인 사항은 국세청·국가법령정보센터의 최신 주세법 조문으로 확인하세요.
          </Callout>
        </section>

        {/* 3. 측정 도구 */}
        <section>
          <h2 className="g-h2">측정 도구 — 비중계 vs 굴절계</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🌡️ 비중계 (Hydrometer)', d: 'SG 직접', desc: '시료 200ml+ 필요. 알코올 있어도 정확. 시간이 다소 걸림. 발효 추적의 표준.', c: 'var(--cat-health)' },
              { t: '💎 굴절계 (Refractometer)', d: 'Brix 직접', desc: '2~3방울이면 됨. 빠름·소량. 단 알코올 있으면 보정식 필요(post-fermentation).', c: 'var(--success)' },
              { t: '🔬 디지털 비중계', d: 'SG·Brix·Temp', desc: '진동관(U자관) 방식 휴대용 밀도계. 수 ml 소량 시료로 SG를 소수 넷째 자리까지 표시하고 온도 보정도 자동. 비중계보다 훨씬 비싸 동호회·소규모 양조장에서 주로 씀.', c: 'var(--cat-art)' },
              { t: '⚗️ pH 미터', d: 'pH·온도', desc: '발효 산도 측정. 사용 전 pH 4·7 표준 완충액으로 2점 교정이 기본이고, 전극은 건조되지 않게 보관액에 보관.', c: 'var(--danger)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px', fontFamily: 'var(--font-sans)' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 비중계 온도 보정 */}
        <section>
          <h2 className="g-h2">비중계 온도 보정 — 교정 온도와 시료 온도가 다를 때</h2>
          <p className="g-p">
            비중계는 <strong style={{ color: 'var(--text)' }}>교정 온도에서만 정확</strong>합니다. 최근 제품은 대부분 20°C, 구형·수입품은 15.6°C(60°F) 교정이며 내부 스케일 종이에 표기되어 있습니다. 시료가 교정 온도보다 따뜻하면 밀도가 낮아져 실제보다 낮게 읽히고, 차가우면 반대입니다. 아래 보정값을 읽은 값에 그대로 더하세요(음수면 빼기).
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['시료 온도', '20°C 교정 비중계', '15.6°C(60°F) 교정 비중계'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['10°C', '−0.0015', '−0.0007'],
                  ['15°C', '−0.0009', '−0.0001'],
                  ['20°C', '0 (보정 불필요)', '+0.0008'],
                  ['25°C', '+0.0012', '+0.0020'],
                  ['30°C', '+0.0026', '+0.0034'],
                  ['35°C', '+0.0042', '+0.0050'],
                  ['40°C', '+0.0061', '+0.0069'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            보정값은 순수 물의 온도별 밀도비로 계산한 값(읽은 값 1.010 부근 기준)으로, 브루잉 계산기들이 쓰는 Lyons(1992) 보정 다항식과 ±0.0001 이내로 일치합니다. 맥주·와인 범위(SG 1.000~1.100)에서 오차는 ±0.0002 이내. 40°C를 넘는 뜨거운 워트는 표 밖 외삽이 커지므로 20°C 부근까지 식혀 재는 것이 정확하고 안전합니다.
          </p>
          <p className="g-p" style={{ marginTop: 16 }}>
            굴절계의 <strong style={{ color: 'var(--text)' }}>ATC(자동온도보정)</strong>는 시료가 아니라 <strong style={{ color: 'var(--text)' }}>프리즘 온도</strong> 기준으로 작동합니다. 확인법: 실온 증류수를 2~3방울 올려 0.0 Brix가 나오는지 체크하고, 아니면 교정 나사로 영점을 맞추세요. 뜨거운 워트는 프리즘에 올린 뒤 20~30초 기다려 온도가 평형된 후 판독해야 하며, 제품 스펙의 ATC 범위(보급형은 대개 10~30°C)를 벗어나면 보정되지 않습니다.
          </p>
        </section>

        {/* 5. 굴절계 FG 보정 워크스루 */}
        <section>
          <h2 className="g-h2">발효 후 굴절계 보정 — Sean Terrill 공식 워크스루</h2>
          <p className="g-p">
            굴절계는 알코올이 생기면 실제보다 높게 읽으므로, 굴절계만으로 발효 후 도수를 구하려면 보정식이 필요합니다. <strong style={{ color: 'var(--text)' }}>발효 전 12.5 Brix, 발효 후 6.0 Brix</strong>로 측정한 맥주를 예로 순서대로 계산하면:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                t: '① 워트 보정계수(WCF 1.04) 적용',
                d: '<code style="color: var(--text)">12.5 ÷ 1.04 = 12.02 &nbsp;/&nbsp; 6.0 ÷ 1.04 = 5.77</code>',
                desc: '맥아 워트는 자당 100%가 아니라서 굴절계가 약간 높게 읽음 — 발효 전·후 판독값 모두 1.04로 나눕니다.',
                c: 'var(--success)',
              },
              {
                t: '② OG 환산',
                d: '<code style="color: var(--text)">12.02 Brix → SG 1.0485</code>',
                desc: '보정된 발효 전 Brix를 본 도구의 5종 환산으로 SG로 바꿉니다.',
                c: 'var(--cat-health)',
              },
              {
                t: '③ 보정 FG — Terrill 선형식',
                d: '<code style="color: var(--text)">FG = 1.0000 − 0.00085683×12.02 + 0.0034941×5.77 = 1.0099</code>',
                desc: '1.0000 − 0.0103 + 0.0202 = 1.0099. 알코올이 부풀린 판독값에서 진짜 잔당 수준의 FG를 복원합니다.',
                c: 'var(--cat-art)',
              },
              {
                t: '④ ABV 계산',
                d: '<code style="color: var(--text)">(1.0485 − 1.0099) × 131.25 ≈ 5.1%</code>',
                desc: '복원한 FG를 단순 공식에 넣으면 완성. 이 값을 본 도구 OG/FG 입력에 넣어 교차 확인할 수 있습니다.',
                c: 'var(--danger)',
              },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${m.c}`, borderRadius: 10, padding: '14px 18px' }}>
                <p style={{ fontSize: 14, color: m.c, fontWeight: 700, margin: '0 0 6px' }}>{m.t}</p>
                <p style={{ fontSize: 14, color: 'var(--text)', margin: '0 0 6px', fontFamily: 'var(--font-sans)' }} dangerouslySetInnerHTML={{ __html: m.d }} />
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="g-note">
            보정 없이 6.0 Brix를 그대로 당도로 환산하면 FG 1.0236, ABV 3.3%가 되어 실제보다 약 1.8%p 낮게 나옵니다 — 알코올이 굴절률을 끌어올려 잔당이 많아 보이기 때문입니다. Terrill의 3차(큐빅) 식은 같은 예에서 FG 1.0109·ABV 4.9%로 선형식과 0.2%p 이내이며, 병입 시점 판단 같은 최종 확인은 여전히 비중계 SG 직접 측정이 표준입니다.
          </p>
        </section>

        {/* 5b. 공식·출처 */}
        <section>
          <h2 className="g-h2">계산식·표준 출처</h2>
          <p className="g-p">
            본 도구의 환산·계산은 아래 공개 표준·자료를 근거로 합니다. 상업 표기·규격 판정은 원문 확인이 우선입니다.
          </p>
          <ul className="g-list">
            <li><strong>당도 다항식(SG↔Brix)</strong> — ASBC(American Society of Brewing Chemists) <em>Methods of Analysis</em> / NBS 자당 밀도표. <a href="https://www.asbc.org/" target="_blank" rel="noopener noreferrer">asbc.org ↗</a></li>
            <li><strong>와인 기준(Baumé·Oechsle)</strong> — OIV <em>International Code of Oenological Practices</em>. <a href="https://www.oiv.int/" target="_blank" rel="noopener noreferrer">oiv.int ↗</a></li>
            <li><strong>ABV 계산식</strong> — 단순식 (OG−FG)×131.25와 고비중용 대체식은 홈브루 업계에서 통용되는 경험식입니다. 공인 분석(상업 라벨)은 증류 후 비중·밀도계 실측이 원칙입니다.</li>
            <li><strong>굴절계 FG 보정</strong> — Sean Terrill, <em>Refractometer FG Correlation</em>(선형·큐빅식).</li>
            <li><strong>비중계 온도 보정</strong> — Lyons(1992) 물 밀도 다항식.</li>
            <li><strong>Proof 표기</strong> — 미국은 현행 규정상 ABV가 기본이고 Proof는 함께 쓸 수 있는 보조 표기(<a href="https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-5/subpart-E/section-5.65" target="_blank" rel="noopener noreferrer">27 CFR 5.65 ↗</a>).</li>
            <li><strong>국내 도수 표기</strong> — 주세법의 알코올분 정의(15°C 기준 부피 백분율, 1도 이상 음료가 주류). <a href="https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A3%BC%EC%84%B8%EB%B2%95" target="_blank" rel="noopener noreferrer">국가법령정보센터 주세법 ↗</a></li>
          </ul>
        </section>

        {/* 6. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 7. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/unit/hardness',           icon: '🛠️', name: '경도 변환기',           desc: 'HRC·HV·HB 강철 경도' },
              { href: '/tools/unit/viscosity',          icon: '🛢️', name: '점도 변환기',           desc: 'cP·cSt·SAE J300 윤활유' },
              { href: '/tools/unit/converter',          icon: '📐', name: '단위 변환기',            desc: '길이·무게·부피 일반' },
              { href: '/tools/cooking/sourdough',       icon: '🍞', name: '사워도우 스타터',        desc: '발효 진단·급이 일정' },
              { href: '/tools/cooking/recipe',          icon: '📏', name: '레시피 비율',           desc: '재료·인분 환산' },
              { href: '/tools/cooking/baking-schedule', icon: '🥖', name: '제빵 타임라인',         desc: '폴딩·발효·굽기 역산' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
                <span style={{ fontSize: '22px' }}>{tool.icon}</span>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{tool.name}</p>
                  <p style={{ fontSize: '12px', color: 'var(--muted)' }}>{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
