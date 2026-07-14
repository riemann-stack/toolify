import Link from 'next/link'
import BrewingClient from './BrewingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

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

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '20px',
  fontWeight: 700,
  marginBottom: '16px',
}

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
                a: '대략 <strong>12.7~13.8% ABV</strong>로 발효됩니다(23 × 0.55~0.60 배수, 계산기 기본값 기준). 정확한 값은 효모 종류(드라이일수록 낮음)·발효 온도(높을수록 잔당 ↓ ABV ↑)·당 잔량(스위트로 만들지 드라이로 만들지)에 따라 ±1% 차이. 일반 가이드: 화이트는 22 Brix 부근, 레드는 24~26 Brix, 디저트 와인은 28~30 Brix로 시작합니다.',
              },
              {
                q: 'pH와 TA(산도)는 왜 같이 측정하나요?',
                a: 'pH는 <strong>현재 산성의 강도</strong>를(로그 스케일), TA(Titratable Acidity)는 <strong>총 산의 농도</strong>를 측정합니다. 와인을 예로, pH 3.5에 TA 6g/L vs pH 3.5에 TA 9g/L는 완전히 다른 와인 — 후자가 입에서 더 시큼하게 느껴지고 보존성도 더 좋습니다. 직접 변환 공식은 없고, <strong>두 값을 모두 측정·기록</strong>해야 발효 진행과 균형을 알 수 있어요.',
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
                a: '<strong>당 함량 65%↑이 미생물 증식을 억제</strong>하는 임계선이기 때문(수분활성도 a<sub>w</sub> ≈ 0.85 이하). 60 Brix는 곰팡이 위험, 65 Brix는 일반 곰팡이·효모 차단, 70 Brix는 모든 균 차단이지만 결정화·끈적임 ↑. 시판 잼은 보통 65~68 Brix. 펙틴 농도와 끓이는 시간으로 조정하며, <strong>굴절계 측정이 가장 정확</strong>(스푼·시각 테스트는 ±5 Brix 오차).',
              },
            ]

export default function BrewingPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>단위·변환</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="unit" />양조 도수·당도 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        <strong style={{ color: 'var(--text)' }}>Brix·Plato·SG·Baumé·Oechsle</strong> 동시 환산 + ABV·Proof 계산. 자가양조·잼·과실주·치즈 메이커용.
      </p>

      <BrewingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 5종 스케일 개요 */}
        <section>
          <h2 style={sectionTitle}>5종 당도·비중 단위 — 언제 어떤 걸 쓰나</h2>
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. ABV 계산 */}
        <section>
          <h2 style={sectionTitle}>ABV 계산 — 발효 도수의 정확한 산출</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            ABV(Alcohol By Volume)는 <strong style={{ color: 'var(--text)' }}>발효 전 비중(OG, Original Gravity)과 발효 후 비중(FG, Final Gravity)의 차이</strong>로 계산합니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                t: '단순 공식 (저알코올 ≤ 12%)',
                d: '<code style="color: var(--text)">ABV% = (OG − FG) × 131.25</code>',
                desc: '비어·사이다·일반 와인에 정확. OG가 1.090 이하 / FG 1.020 이하 범위에서 ±0.3% 오차.',
                c: 'var(--success)',
              },
              {
                t: '보정 공식 (고알코올 12%↑)',
                d: '<code style="color: var(--text)">ABV% = (76.08 × (OG−FG) / (1.775−OG)) × (FG / 0.794)</code>',
                desc: '디저트 와인·고알코올 IPA·미드(꿀술)에 권장. Cutaia et al. 2009 공식 — 알코올 밀도 보정 포함.',
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
                <p style={{ fontSize: 14, color: 'var(--text)', margin: '0 0 6px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }} dangerouslySetInnerHTML={{ __html: m.d }} />
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 측정 도구 */}
        <section>
          <h2 style={sectionTitle}>측정 도구 — 비중계 vs 굴절계</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '🌡️ 비중계 (Hydrometer)', d: 'SG 직접', desc: '시료 200ml+ 필요. 알코올 있어도 정확. 시간이 다소 걸림. 발효 추적의 표준.', c: 'var(--cat-health)' },
              { t: '💎 굴절계 (Refractometer)', d: 'Brix 직접', desc: '2~3방울이면 됨. 빠름·소량. 단 알코올 있으면 보정식 필요(post-fermentation).', c: 'var(--success)' },
              { t: '🔬 디지털 비중계', d: 'SG·Brix·Temp', desc: 'Anton Paar Easy Dens 등. 정확도 ±0.0005 SG. 가격 30~50만원.', c: 'var(--cat-art)' },
              { t: '⚗️ pH 미터', d: 'pH·온도', desc: '발효 산도 측정. 저가 ~3만원 / 정밀 10만원+. 보정 솔루션 필수.', c: 'var(--danger)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, margin: '0 0 6px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. 비중계 온도 보정 */}
        <section>
          <h2 style={sectionTitle}>비중계 온도 보정 — 교정 온도와 시료 온도가 다를 때</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            비중계는 <strong style={{ color: 'var(--text)' }}>교정 온도에서만 정확</strong>합니다. 최근 제품은 대부분 20°C, 구형·수입품은 15.6°C(60°F) 교정이며 내부 스케일 종이에 표기되어 있습니다. 시료가 교정 온도보다 따뜻하면 밀도가 낮아져 실제보다 낮게 읽히고, 차가우면 반대입니다. 아래 보정값을 읽은 값에 그대로 더하세요(음수면 빼기).
          </p>
          <div style={{ overflowX: 'auto' }}>
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
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '12px', marginBottom: '10px' }}>
            보정값은 순수 물의 온도별 밀도비로 계산한 값(읽은 값 1.010 부근 기준)으로, 브루잉 계산기들이 쓰는 Lyons(1992) 보정 다항식과 ±0.0001 이내로 일치합니다. 맥주·와인 범위(SG 1.000~1.100)에서 오차는 ±0.0002 이내. 40°C를 넘는 뜨거운 워트는 표 밖 외삽이 커지므로 20°C 부근까지 식혀 재는 것이 정확하고 안전합니다.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, margin: 0 }}>
            굴절계의 <strong style={{ color: 'var(--text)' }}>ATC(자동온도보정)</strong>는 시료가 아니라 <strong style={{ color: 'var(--text)' }}>프리즘 온도</strong> 기준으로 작동합니다. 확인법: 실온 증류수를 2~3방울 올려 0.0 Brix가 나오는지 체크하고, 아니면 교정 나사로 영점을 맞추세요. 뜨거운 워트는 프리즘에 올린 뒤 20~30초 기다려 온도가 평형된 후 판독해야 하며, 제품 스펙의 ATC 범위(보급형은 대개 10~30°C)를 벗어나면 보정되지 않습니다.
          </p>
        </section>

        {/* 5. 굴절계 FG 보정 워크스루 */}
        <section>
          <h2 style={sectionTitle}>발효 후 굴절계 보정 — Sean Terrill 공식 워크스루</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
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
                <p style={{ fontSize: 14, color: 'var(--text)', margin: '0 0 6px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }} dangerouslySetInnerHTML={{ __html: m.d }} />
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, margin: '12px 0 0' }}>
            보정 없이 6.0 Brix를 그대로 당도로 환산하면 FG 1.0236, ABV 3.3%가 되어 실제보다 약 1.8%p 낮게 나옵니다 — 알코올이 굴절률을 끌어올려 잔당이 많아 보이기 때문입니다. Terrill의 3차(큐빅) 식은 같은 예에서 FG 1.0109·ABV 4.9%로 선형식과 0.2%p 이내이며, 병입 시점 판단 같은 최종 확인은 여전히 비중계 SG 직접 측정이 표준입니다.
          </p>
        </section>

        {/* 5b. 공식·출처 */}
        <section>
          <h2 style={sectionTitle}>계산식·표준 출처</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            본 도구의 환산·계산은 아래 공개 표준·논문을 근거로 합니다. 상업 표기·규격 판정은 원문 확인이 우선입니다.
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 2.0 }}>
            <li><strong style={{ color: 'var(--text)' }}>당도 다항식(SG↔Brix)</strong> — ASBC(American Society of Brewing Chemists) <em>Methods of Analysis</em> / NBS 자당 밀도표. <a href="https://www.asbc.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>asbc.org ↗</a></li>
            <li><strong style={{ color: 'var(--text)' }}>와인 기준(Baumé·Oechsle)</strong> — OIV <em>International Code of Oenological Practices</em>. <a href="https://www.oiv.int/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>oiv.int ↗</a></li>
            <li><strong style={{ color: 'var(--text)' }}>고알코올 ABV 보정식</strong> — Cutaia, Reid &amp; Speers (2009), <em>Examination of the Relationships between Original, Real and Apparent Extracts, and Alcohol in Pilot Plant and Commercially Produced Beers</em>, Journal of the Institute of Brewing 115(4).</li>
            <li><strong style={{ color: 'var(--text)' }}>굴절계 FG 보정</strong> — Sean Terrill, <em>Refractometer FG Correlation</em>(선형·큐빅식).</li>
            <li><strong style={{ color: 'var(--text)' }}>비중계 온도 보정</strong> — Lyons(1992) 물 밀도 다항식.</li>
            <li><strong style={{ color: 'var(--text)' }}>Proof 표기</strong> — 미국은 현행 규정상 ABV가 기본이고 Proof는 함께 쓸 수 있는 보조 표기(<a href="https://www.ecfr.gov/current/title-27/chapter-I/subchapter-A/part-5/subpart-E/section-5.65" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>27 CFR 5.65 ↗</a>).</li>
          </ul>
        </section>

        {/* 6. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </section>

        {/* 7. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/unit/hardness',           icon: '🛠️', name: '경도 변환기',           desc: 'HRC·HV·HB 강철 경도' },
              { href: '/tools/unit/viscosity',          icon: '🛢️', name: '점도 변환기',           desc: 'cP·cSt·SAE J300 윤활유' },
              { href: '/tools/unit/converter',          icon: '📐', name: '단위 변환기',            desc: '길이·무게·부피 일반' },
              { href: '/tools/cooking/sourdough',       icon: '🍞', name: '사워도우 스타터',        desc: '발효 진단·급이 일정' },
              { href: '/tools/cooking/recipe',          icon: '📏', name: '레시피 비율',           desc: '재료·인분 환산' },
              { href: '/tools/cooking/baking-schedule', icon: '🥖', name: '제빵 타임라인',         desc: '폴딩·발효·굽기 역산' },
            ].map((tool, i) => (
              <Link key={i} href={tool.href} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px', textDecoration: 'none', display: 'grid', gridTemplateColumns: '32px 1fr', gap: '10px', alignItems: 'center', color: 'inherit' }}>
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
    </div>
  )
}
