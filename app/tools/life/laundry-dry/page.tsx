import Link from 'next/link'
import LaundryDryClient from './LaundryDryClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import { KRW_PER_KWH, KEPCO_RATES_ASOF, KEPCO_RESIDENTIAL_LOW_TIERS, tempFactorOf, humidFactorOf, evaluateCombo } from './laundryUtils'
import { KEPCO_RATES_SOURCE_URL, KEPCO_RATES_EFFECTIVE } from '@/lib/krElectricityRates'
import ToolPage from '@/components/ToolPage'
import UpdatedMeta from '@/components/UpdatedMeta'
import Callout from '@/components/Callout'

export const metadata = buildMetadata({
  path: '/tools/life/laundry-dry',
  title: '빨래 건조 시간 계산기 — 최단 조합 추천·전기료 비교·욕실 건조',
  description: '온도·습도·소재 + 보유 장비(제습기·서큘레이터·욕실 환풍기)별 가장 빠른 건조 조합 추천. 전기료 비교·누진제 안내·목표 시간 역산·장마철 욕실 건조 가이드까지.',
  keywords: ['빨래건조시간계산기', '빨래건조시간', '세탁건조시간', '실내빨래건조', '청바지건조시간', '빨래빨리말리는법', '빨래건조팁', '장마철 빨래', '욕실 빨래 건조', '제습기 효과', '서큘레이터 빨래', '빨래 전기료', '한국 가정 빨래'],
})

/* 가이드 수치 — 계산기와 같은 곡선(laundryUtils)에서 빌드 시 계산 */
const pctDown = (after: number, before: number) => Math.round((1 - after / before) * 100)
const HUMID_RATIO_90_40 = (humidFactorOf(90) / humidFactorOf(40)).toFixed(1)
const TEMP_18_28 = pctDown(tempFactorOf(28), tempFactorOf(18))
const TEMP_5_15 = pctDown(tempFactorOf(15), tempFactorOf(5))
const FACTOR_ROWS = [
  [0, 30], [5, 40], [10, 50], [15, 60], [18, 65], [22, 70], [28, 80], [35, 90],
].map(([t, h]) => ({ t, tf: tempFactorOf(t), h, hf: humidFactorOf(h) }))
const DEHUMID_90 = evaluateCombo(['dehumidifier'], 300, { temp: 22, humidity: 90 }).reductionPct
const DEHUMID_60 = evaluateCombo(['dehumidifier'], 300, { temp: 22, humidity: 60 }).reductionPct
const AIRCON_90 = evaluateCombo(['aircon-dry'], 300, { temp: 25, humidity: 90 }).reductionPct
const AIRCON_CIRC_90 = evaluateCombo(['aircon-dry', 'circulator'], 300, { temp: 25, humidity: 90 }).reductionPct

const FAQ_LD = [
              { q: '겉마름과 완전 건조의 차이는 무엇인가요?',
                a: '겉마름은 표면이 건조한 상태이지만 내부 섬유에 수분이 남아있는 상태입니다. 겉마름 상태로 접어 보관하면 냄새가 날 수 있습니다. 완전 건조는 섬유 내부까지 수분이 없는 상태로, 특히 두꺼운 수건·청바지·후드티는 겉은 말라도 안쪽은 축축한 경우가 많아 완전 건조 시간이 중요합니다.' },
              { q: '실내 건조 시 빨래 냄새를 없애려면?',
                a: '실내 건조 냄새의 주범은 모락셀라균(Moraxella osloensis)입니다. 예방법은 ① 세탁 후 즉시 건조 시작(30분 이상 방치 금지), ② 건조 시간 최대한 단축(선풍기·제습기 활용), ③ 세탁 시 구연산·베이킹소다 추가, ④ 통풍이 잘 되는 곳에서 건조하는 것입니다.' },
              { q: '탈수를 강하게 하면 옷이 상하나요?',
                a: '면·합성섬유는 강한 탈수에 비교적 강하지만, 울·실크·린넨은 형태가 변형될 수 있습니다. 울은 손 세탁 후 수건으로 물기를 눌러 제거하는 것이 가장 안전합니다. 속옷이나 얇은 소재는 보통~약한 탈수를 권장합니다.' },
              { q: '이불커버는 얼마나 걸리나요?',
                a: '이불커버는 면 소재 기준 실외 맑은 날 6~8시간, 실내에서는 12시간 이상 걸릴 수 있습니다. 건조 중 1~2회 위치를 바꿔주면 접힌 부분도 균일하게 마릅니다. 이불 본체는 훨씬 오래 걸려 가능하면 코인세탁방 건조기 사용을 추천합니다.' },
              { q: '빨래건조지수란 무엇인가요?',
                a: '기온·습도·바람·햇빛을 종합해 빨래가 얼마나 잘 마르는 날씨인지 단계로 나타낸 생활 날씨 지표입니다. 제공처와 단계 구분은 날씨 서비스마다 다릅니다. 본 계산기는 이와 유사한 방식으로 각 조건을 종합해 예상 건조 시간을 계산합니다.' },
              { q: '보유 장비별 가장 빠른 건조 조합은?',
                a: '본 도구의 [⚡ 최단 조합 추천] 탭에서 보유 장비별 모든 조합을 자동 계산합니다. <strong>단축률은 습도가 높을수록 제습 효과가 커져 환경에 따라 달라집니다.</strong> 장마철(습도 90%) 예시:<br/>• <strong>1순위:</strong> 제습기 + 서큘레이터 + 추가 탈수 (약 -67%)<br/>• 제습기 + 서큘레이터 (약 -60%)<br/>• 제습기가 없으면 서큘레이터 + 추가 탈수 (약 -51%, 거의 무료)<br/>• 가장 저렴: 서큘레이터만 (약 -40%)<br/>※ 에어컨 제습은 단독으로 약 -35~40%, 서큘레이터와 함께 쓰면 -60%대로 강력하지만 전력(800W)이 큽니다. 습도가 낮은 봄·가을엔 제습 효과가 작아 서큘레이터·추가 탈수가 더 효율적, 겨울은 난방을 권장합니다. 탭 결과가 가장 정확합니다.' },
              { q: '빨래 건조에 전기료 얼마나 드나요?',
                a: `5시간 사용 기준 (기본요금·부가세 등 포함 가구 평균 약 ${KRW_PER_KWH}원/kWh):<br/>• 선풍기: <strong>약 50원</strong><br/>• 서큘레이터: 약 30원 (★ 가장 효율적)<br/>• 제습기: 약 200원 (장마철 필수)<br/>• 에어컨 제습: 약 800원 (전기료 ↑)<br/>• 난방·라디에이터: 약 1,500원<br/>가장 저렴한 옵션은 서큘레이터만 사용. 누진제 3단계(월 400kWh 초과) 가구는 추가로 쓰는 전기의 단가가 높아 실제 비용이 이보다 더 나옵니다.` },
              { q: '욕실에서 빨래 건조해도 되나요?',
                a: '한국 가정 인기 방법, 단 주의 필요:<br/><strong>장점</strong> — 작은 공간 + 환풍기 효율 ↑ (-25%), 거실 공간 절약<br/><strong>주의</strong> — 욕실 곰팡이 ↑ 가능성 / 사용 후 24시간+ 환풍기 가동 / 1~2명분만 (이불·다수 X) / 대안으로 발코니·베란다 우선 권장.' },
              { q: '오늘 저녁 6시까지 빨래 마르나요?',
                a: '본 도구의 [🎯 목표 시간 역산] 탭 활용. 목표 시각·보유 장비를 입력하면 ① 가장 빠른 ② 균형 ③ 최저 비용 ④ 자연 건조 4가지 시나리오를 자동 비교합니다. 일반 가이드 (티셔츠 기준): 2시간 → 실외 + 직사광 + 서큘 / 4시간 → 베란다 + 제습기 / 6시간 → 실내 + 자연 건조 + 선풍기 / 12시간 → 장마철 자연 건조(무리).' },
              { q: '빨래 곰팡이·세균 냄새 어떻게 예방하나요?',
                a: '모락셀라균(Moraxella osloensis)이 주범. 예방법:<br/>1. <strong>세탁 후 30분 이내 건조 시작</strong><br/>2. 건조 시간 6시간 이내 목표<br/>3. 세탁 시 구연산·베이킹소다 (반 컵)<br/>4. 통풍·바람 (선풍기 필수)<br/>5. 빨래 간격 손바닥 1개 이상<br/>6. 60°C 이상 삶기 (수건·속옷, 주 1회)<br/>7. 세탁기 통세척 (월 1회)<br/>장마철은 제습기 + 욕실 환풍기를 함께 쓰고 삶는 빈도를 늘리세요. 이미 밴 냄새는 다시 말려도 잘 빠지지 않으므로 60°C 이상 온수 세탁이나 산소계 표백제로 한 번 더 빨고, 곰팡이 얼룩까지 생겼다면 교체를 고려하세요.' },
            ]

export default function LaundryDryPage() {
  return (
    <ToolPage width={760} slug="/tools/life/laundry-dry">
      <h1 className="tp-h1">
        <ToolIconBadge catId="life" />빨래 건조 시간 계산기
      </h1>
      <p className="tp-lead">
        온도·습도·소재별 <strong style={{ color: 'var(--text)' }}>가장 빠른 건조 조합</strong> + 전기료 비교까지.
      </p>
      <UpdatedMeta
        date="2026년 9월"
        basis={`건조 시간 = 의류 기본 시간 × 소재·두께·탈수·간격 × 기온·습도(구간 보간)·바람·햇빛·장소 계수 — 생활 경험 기반 추정 모델(실측 아님) · 전기료 = 소비전력 × 사용 시간 × 가구 평균 ${KRW_PER_KWH}원/kWh(기본요금·부가세 등 포함 어림값) · 누진 단계 = 한전 주택용(저압) 전력량요금(${KEPCO_RATES_EFFECTIVE} 시행분)`}
        sources={[
          { label: '한국전력 — 주택용 전기요금표', href: 'https://home.kepco.co.kr/kepco/front/html/CY/E/E/CYEEHP00101.html' },
          { label: 'Kubota et al. (2012) — 빨래 냄새의 주원인 모락셀라균, Applied and Environmental Microbiology', href: 'https://pubmed.ncbi.nlm.nih.gov/22367080/' },
        ]}
      />

      <LaundryDryClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 핵심 4요소 ── */}
        <div>
          <h2 className="g-h2">
            건조에 영향을 주는 4가지 핵심 요소
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '①', title: '습도',   desc: `가장 큰 영향 요인. 이 계산기 기준 습도 90%는 40%보다 건조 시간이 <strong>약 ${HUMID_RATIO_90_40}배</strong> 걸립니다. 공기 중 수증기가 많을수록 옷의 수분이 증발할 여유가 줄어듭니다.`, color: 'var(--accent-ink)' },
              { n: '②', title: '온도',   desc: `기온이 오르면 공기가 품을 수 있는 수증기량(포화수증기압)이 커져 같은 습도에서도 빨리 마릅니다. 18°C→28°C면 시간이 <strong>약 ${TEMP_18_28}%</strong>, 5°C→15°C면 <strong>약 ${TEMP_5_15}%</strong> 줄어 추운 날일수록 기온 효과가 큽니다.`, color: 'var(--orange-600)' },
              { n: '③', title: '바람',   desc: '바람은 옷 표면의 눅눅한 공기층을 쓸어내 건조를 가속합니다. 강풍 시 무풍 대비 건조 시간이 <strong>절반 이하</strong>로 줄어듭니다.', color: 'var(--cyan-600)' },
              { n: '④', title: '소재',   desc: '울·데님은 섬유가 두껍고 흡수율이 높아 오래 걸립니다. 합성섬유는 친수성이 낮아 면보다 30% 빠르게 건조됩니다.', color: 'var(--emerald-600)' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid color-mix(in srgb, ${item.color} 27%, transparent)`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: item.color, fontWeight: 700, marginBottom: '6px' }}>{item.n} {item.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }} dangerouslySetInnerHTML={{ __html: item.desc.replace(/<strong>/g, '<strong style="color: var(--text)">') }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── 1-2. 계산 방식 ── */}
        <div>
          <h2 className="g-h2">
            계산기는 어떻게 추정하나요?
          </h2>
          <p className="g-p">
            예상 완전 건조 시간은 <strong>의류 기본 시간 × 옷 계수(소재·두께·탈수·간격) × 환경 계수(기온·습도·바람·햇빛·장소)</strong>로 계산합니다.
            기본 시간은 면 티셔츠 2시간, 수건 3시간, 청바지 6시간, 이불커버 7시간처럼 의류마다 정해져 있고, 여러 벌을 함께 널면 가장 오래 걸리는 옷을 기준으로 삼습니다.
            겉마름은 완전 건조 시간의 60% 시점이고, 결과에 함께 표시되는 범위는 완전 건조 ±20%, 겉마름 ±15%입니다. 난방은 기온 +5°C, 제습기는 습도 −15%p, 실내에서 창문을 열면 바람 한 단계 상승으로 반영되고, 메인 계산기의 선풍기·서큘레이터 토글은 시간을 30% 줄입니다([최단 조합 추천] 탭은 선풍기 30%·서큘레이터 40%로 따로 계산).
          </p>
          <p className="g-p">
            기온과 습도는 구간을 나눠 끊어 쓰지 않고 아래 점들 사이를 직선으로 이어(선형 보간) 연속적으로 바뀌게 했습니다. 배수가 1보다 크면 그만큼 오래 걸린다는 뜻으로,
            기준(1.0)은 기온 22°C · 습도 65%입니다. 이 곡선은 실험실 측정값이 아니라 일반적인 생활 경험을 바탕으로 한 추정치라, 결과는 “대략 몇 시간대인지”를 가늠하는 용도로 보세요.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['기온', '시간 배수', '습도', '시간 배수'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FACTOR_ROWS.map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: 'var(--text)' }}>{r.t}°C</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: r.tf > 1 ? 'var(--warning)' : 'var(--success)', fontWeight: 700 }}>×{r.tf.toFixed(2)}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: 'var(--text)' }}>{r.h}%</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: r.hf > 1 ? 'var(--warning)' : 'var(--success)', fontWeight: 700 }}>×{r.hf.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 기온·습도 배수는 위 계산기가 쓰는 값과 같습니다. 영하에서는 빨래가 얼었다가 승화하며 마르는 등 변수가 커서 추정 오차가 더 큽니다.
          </p>
        </div>

        {/* ── 2. 소재별·의류별 평균 건조 시간표 ── */}
        <div>
          <h2 className="g-h2">
            소재별·의류별 평균 건조 시간
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            기준 조건(계산기 기본값): 베란다·간접광, 온도 18°C, 습도 60%, 바람 약함, 탈수·간격 보통. 조건을 바꾸면 위 계산기가 더 정밀하게 산출합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['의류', '소재', '겉마름', '완전건조'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i < 2 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { item: '티셔츠',   mat: '면',        surf: '1~1.5시간',  full: '2~2.5시간' },
                  { item: '티셔츠',   mat: '합성섬유',   surf: '50분~1시간', full: '1~1.5시간' },
                  { item: '청바지',   mat: '데님',       surf: '4~5시간',    full: '7~9시간' },
                  { item: '수건',     mat: '면',        surf: '1.5~2시간',  full: '3~3.5시간' },
                  { item: '후드티',   mat: '면 혼방',    surf: '2.5~3시간',  full: '4~5시간' },
                  { item: '이불커버', mat: '면',        surf: '4~4.5시간',  full: '7~8시간' },
                  { item: '양말',     mat: '합성혼방',   surf: '40~50분',    full: '1~1.5시간' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row.item}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row.mat}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--cyan-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.surf}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.full}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 환경별 건조 속도 비교 ── */}
        <div>
          <h2 className="g-h2">
            환경별 건조 속도 비교
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            동일 조건 기준: 면 티셔츠, 탈수·간격 보통, 바람 약함(실내 밀폐는 무풍), 실내는 햇빛 없음
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 540 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['환경', '여름 (28°C, 80%)', '봄·가을 (18°C, 55%)', '겨울 (5°C, 60%)'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { env: '실외 직사광',   summer: '1.5~2시간',   spring: '1~1.5시간',   winter: '1.5~2.5시간' },
                  { env: '베란다 간접광', summer: '2.5~3시간',   spring: '1.5~2.5시간', winter: '2.5~3.5시간' },
                  { env: '실내 환기',     summer: '4~5시간',     spring: '3~4시간',     winter: '4.5~5.5시간' },
                  { env: '실내 밀폐',     summer: '5.5~6.5시간', spring: '4~5시간',     winter: '6~7시간' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{row.env}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--orange-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.summer}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.spring}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--cyan-600)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row.winter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4. 장마·겨울 실내 팁 ── */}
        <div>
          <h2 className="g-h2">
            장마철·겨울 실내 건조 팁
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--cyan-600) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--cyan-600)', fontWeight: 700, marginBottom: '10px' }}>장마철 (습도 80~90%)</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <li>제습기 필수 (없으면 에어컨 제습 모드)</li>
                <li>선풍기로 바람 직접 쐬기</li>
                <li>화장실 환풍기 틀고 욕실 건조 추천</li>
                <li>건조 시간 최소 <strong style={{ color: 'var(--text)' }}>1.5~2배</strong> 예상</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--orange-600) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--orange-600)', fontWeight: 700, marginBottom: '10px' }}>겨울 실내 건조</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <li>난방 건조한 공기 활용 가능하지만 정전기 주의</li>
                <li>가습기 사용 중이면 건조 효과 상쇄</li>
                <li>라디에이터·히터 <strong style={{ color: 'var(--text)' }}>근처</strong>에 두면 빨리 마름</li>
                <li><strong style={{ color: 'var(--text)' }}>히터에 직접 닿게 두면 화재 위험</strong> — 거리를 두세요</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 5. 빨리 말리는 법 TOP 7 ── */}
        <div>
          <h2 className="g-h2">
            빨래 빨리 말리는 법 TOP 7
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { n: '1', icon: '💨', title: '선풍기·서큘레이터 직접 바람 쐬기', save: '30~40% 단축' },
              { n: '2', icon: '↔️', title: '빨래 간격 손 하나 이상 벌려 널기',   save: '25% 단축' },
              { n: '3', icon: '🌀', title: '탈수 한 번 더 강하게 돌리기',        save: '15~20% 단축' },
              { n: '4', icon: '🧻', title: '수건으로 남은 물기 눌러서 제거',     save: '10% 단축' },
              { n: '5', icon: '🔄', title: '청바지·후드는 뒤집어서 건조',        save: '균일 건조' },
              { n: '6', icon: '🔀', title: '두꺼운 것은 자주 위치 바꾸기',       save: '얼룩 방지' },
              { n: '7', icon: '☀️', title: '오전 10시~오후 2시 습도 낮은 시간대', save: '자연 건조 최적' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-m)', padding: '12px 16px',
              }}>
                <span style={{
                  fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '16px',
                  color: 'var(--accent-ink)', minWidth: 24,
                }}>{item.n}</span>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)', fontWeight: 500 }}>{item.title}</span>
                <span style={{ fontSize: '12px', color: 'var(--success)', fontFamily: 'var(--font-sans)', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.save}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 한국 장비별 효과 비교 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            한국 가정 장비별 효과 & 전력 비교
          </h2>
          <p className="g-p">
            본 도구의 [최단 조합 추천] 탭에서 보유 장비를 체크하면 모든 조합(2<sup>N</sup>개)을 평가해 가장 효율적인 조합을 자동 추천합니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>장비</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>효과</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>전력</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>5시간 전기료</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '선풍기',          eff: '시간 -30%',      w: '50W',    cost: '약 50원' },
                  { n: '서큘레이터',      eff: '시간 -40% (강력)', w: '30W',    cost: '약 30원' },
                  { n: '욕실 환풍기',   eff: '시간 -25%',      w: '30W',    cost: '약 30원' },
                  { n: '제습기',          eff: '습도 -15%p',     w: '200W',   cost: '약 200원' },
                  { n: '에어컨 제습',     eff: '습도 -20%p · 온도 -3°C', w: '800W', cost: '약 800원' },
                  { n: '난방·라디에이터', eff: '온도 +5°C',      w: '1,500W', cost: '약 1,500원' },
                  { n: '건조대 2개',      eff: '시간 -15%',      w: '0W',     cost: '0원' },
                  { n: '추가 탈수 1회',  eff: '시간 -18%',      w: '100W',   cost: '약 3원 (10분)' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.eff}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>{r.w}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{r.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.6 }}>
            * 가구 평균 약 {KRW_PER_KWH}원/kWh(기본요금·부가세 등 포함) 기준. 같은 카테고리(예: 선풍기 + 서큘레이터) 동시 사용 시 효과가 큰 쪽만 적용됩니다. 제습기·에어컨·난방의 실제 시간 단축률은 <strong style={{ color: 'var(--text)' }}>현재 습도·온도에 따라 달라집니다</strong>(고습도일수록 제습 효과 ↑) — 위 [최단 조합 추천] 탭이 환경별로 자동 계산합니다.
            예를 들어 같은 제습기(습도 -15%p)라도 습도 90%에서는 건조 시간이 약 {DEHUMID_90}% 줄지만 60%에서는 약 {DEHUMID_60}%만 줄고,
            에어컨 제습은 단독으로 약 {AIRCON_90}%(25°C·습도 90%), 서큘레이터와 함께면 약 {AIRCON_CIRC_90}% 줄어듭니다.
          </p>
        </div>

        {/* ── 7. 한국 전기료 누진제 (NEW) ── */}
        <div>
          <h2 className="g-h2">
            한국 전기료 누진제 영향
          </h2>
          <p className="g-p">
            본 도구는 기본요금·기후환경요금·부가세 등을 모두 합친 가구 평균 약 <strong style={{ color: 'var(--text)' }}>{KRW_PER_KWH}원/kWh</strong>로 전기료를 추정합니다. 실제 요금은 누진 단계에 따라 큰 차이가 납니다. 아래는 한전 주택용(저압) 구간별 전력량요금입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>구간 (월)</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>kWh당 전력량요금</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left',  color: 'var(--muted)', fontWeight: 500 }}>예시 가정</th>
                </tr>
              </thead>
              <tbody>
                {KEPCO_RESIDENTIAL_LOW_TIERS.map((t, i) => ({
                  s: `${t.label} (${t.range})`,
                  p: `${t.krwPerKwh.toFixed(1)}원`,
                  e: ['1~2인 가정·절약 가구', '평균 가정', '여름·겨울 에어컨/난방 가정'][i],
                })).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent-ink)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="warn" title="실제 요금은 표보다 큽니다">
            7~8월에는 구간이 {KEPCO_RESIDENTIAL_LOW_TIERS.map(t => t.summerRange).slice(0, 2).join(' / ')}로 넓어집니다. 기본요금·기후환경요금·연료비조정요금·부가세·전력기반기금은 별도라 실제 kWh당 부담은 표보다 큽니다. 기준: {KEPCO_RATES_ASOF}, <a href={KEPCO_RATES_SOURCE_URL} target="_blank" rel="noopener noreferrer">한국전력 주택용 전기요금표</a>. 정확한 요금은 한국전력 고객센터(123) 또는 한전 앱에서 확인하세요.
          </Callout>
        </div>

        {/* ── 8. 욕실 건조 가이드 (NEW, 한국 핵심) ── */}
        <div>
          <h2 className="g-h2">
            욕실 빨래 건조 가이드 (한국 가정 인기 방법)
          </h2>
          <p className="g-p">
            한국 가정에서 흔한 욕실 건조법. 작은 공간 + 환풍기 효율로 시간 25% 단축 효과. 단, 곰팡이 주의가 필수입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--success) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--success)', fontWeight: 700, marginBottom: '10px' }}>장점</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <li>작은 공간 + 환풍기 효율 ↑ (-25%)</li>
                <li>거실·방 공간 절약</li>
                <li>장마철 실내 체류 시 추천</li>
                <li>환풍기 30W로 매우 저렴 (5시간 약 30원)</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid color-mix(in srgb, var(--warning) 30%, transparent)', borderRadius: 'var(--radius-m)', padding: '16px 20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--warning)', fontWeight: 700, marginBottom: '10px' }}>주의</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <li>욕실 곰팡이 발생 위험 ↑</li>
                <li>사용 후 24시간+ 환풍기 가동 (환기)</li>
                <li>1~2명분만 (이불·다수 X)</li>
                <li>대안: 발코니/베란다 우선, 코인세탁 건조기</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 9. FAQ (accordion) ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 7. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/life/pomodoro',    icon: '🍅', name: '뽀모도로 타이머',  desc: '건조 시간 동안 집중 작업' },
              { href: '/tools/date/dday',        icon: '📅', name: 'D-Day 계산기', desc: '두 날짜 사이·시간 단위 기간' },
              { href: '/tools/unit/converter',   icon: '📐', name: '단위 변환기',       desc: '온도·길이·무게 등 14종 통합 변환' },
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
        </div>

      </div>
    </ToolPage>
  )
}
