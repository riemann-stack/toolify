import Link from 'next/link'
import RadiationClient from './RadiationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolPage from '@/components/ToolPage'
import Callout from '@/components/Callout'
import { convertRate } from './radiationData'

export const metadata = buildMetadata({
  path: '/tools/unit/radiation',
  title: '방사선·전자파 단위 변환기 — Sv·rem·Gy·rad·Bq·Ci + 일상 노출 비교',
  description:
    '시버트·렘·그레이·라드·베크렐·큐리 동시 환산 + μSv/h ↔ mSv/년 노출률 변환. 비행기·CT·치과 X-ray 일상 노출 비교 + SAR·EMF 별도 섹션.',
  keywords: [
    '방사선 단위', 'Sievert 변환', 'mSv μSv', '시버트 렘',
    'Gray rad', '베크렐 큐리', 'Bq Ci 변환',
    '방사선량 계산기', '연간 방사선 노출',
    'CT 방사선량', '치과 X-ray', '항공 방사선', '후쿠시마 방사능',
    '바나나 등가량', 'EMF 단위', 'SAR 휴대폰', 'μT 자기장', 'ICRP 한도',
  ],
})

// 노출률 환산표 — 도구와 같은 convertRate(24시간 × 365일 = 8,760시간 가정)로 빌드 시 계산
const RATE_ROWS: { v: number; note: string }[] = [
  { v: 0.05, note: '국내 환경방사선 평상 범위(50~300 nSv/h)의 하단' },
  { v: 0.12, note: '도구 노출률 카드 기본값(자연 배경)' },
  { v: 0.3, note: '국내 환경방사선 평상 범위의 상단' },
  { v: 1, note: '암산 기준 — μSv/h × 8.76 = mSv/년' },
  { v: 5, note: '순항 고도 항공기 내부(도구 프리셋)' },
]
const trim = (n: number, d: number) => Number(n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d })
const DEFAULT_RATE = convertRate(0.12, 'usv_h')
const FLIGHT_YEAR = convertRate(5, 'usv_h').msv_year

const FAQ_LD = [
              {
                q: '방사능과 방사선의 차이는?',
                a: '<strong>방사능(Radioactivity)</strong>은 물질의 성질로 "얼마나 방사선을 내는지"를 가리키며 단위는 Bq·Ci. <strong>방사선(Radiation)</strong>은 그 물질에서 나오는 에너지(알파·베타·감마·X-ray 등). 비유하자면 방사능은 "전구의 와트수", 방사선은 "그 전구에서 나오는 빛"입니다. 인체 영향을 평가할 땐 받은 양(유효선량, Sv·rem)이 가장 중요합니다.',
              },
              {
                q: 'CT 1회 방사선이 정말 위험한가요?',
                a: '<strong>일반적인 CT 1회(7~10 mSv)는 자연 노출 2~3년치에 해당</strong>합니다. ICRP 명목 위험계수(약 5.5%/Sv)로 추정하면 <strong>10,000명당 약 4~6명(대략 1/2,000) 수준의 추가 암 위험</strong>이에요 — 한국인 평생 암 발생 확률(약 35~38%)에 비하면 작지만 0은 아니라서, 의학적으로 필요한 검사만 받는 것이 원칙입니다. 반복 촬영이나 어린이·임산부는 더 신중해야 하며, 대부분의 경우 진단으로 얻는 이익이 이 위험보다 훨씬 큽니다. 참고로 &lsquo;10,000명당 1명 미만&rsquo;은 일반 X-ray급(1~2 mSv 이하) 검사에 해당하는 표현입니다.',
              },
              {
                q: '비행기를 자주 타면 방사선 노출이 위험한가요?',
                a: '<strong>일반 승객은 거의 무시할 수준</strong>입니다. 한국천문연구원 측정 기준 인천→뉴욕 <strong>편도 약 0.08 mSv, 왕복 약 0.15~0.17 mSv</strong>(북극항로, 가슴 X-ray 1~2회 수준)예요. 매달 왕복해도 연 2 mSv 정도로 자연 노출(연 3 mSv)보다 적고, 항공 피폭은 우주방사선(자연 노출)이라 일반인 &lsquo;인공&rsquo; 한도(1 mSv)와는 별개로 관리됩니다. 다만 <strong>승무원·조종사는 직무상 연 1.5~3 mSv</strong>를 추가로 받아 생활주변방사선법상 관리 대상이며, 임신 중 승무원은 기준이 더 엄격합니다.',
              },
              {
                q: '치과 X-ray는 안전한가요?',
                a: '노출량이 매우 낮습니다. <strong>치과 Bitewing 1장 ≈ 5 μSv (0.005 mSv)</strong>로 자연 노출 반나절치, 비행 1시간 수준이에요. 디지털 센서가 표준화된 현재는 더 낮습니다. 임산부도 납복(lead apron) 차폐를 하면 태아 노출이 미미해 필요 시 시술 가능합니다.',
              },
              {
                q: '바나나에서 방사선이 나온다는 게 사실인가요?',
                a: '<strong>네, 모든 음식에 자연 방사성 물질이 있습니다.</strong> 바나나는 칼륨-40(K-40)이 풍부해 1개당 약 0.1 μSv를 받습니다. 이를 <strong>BED (Banana Equivalent Dose)</strong>라 부르며 일상 노출을 직관적으로 비유할 때 씁니다. CT 1회 ≈ 7만 개 바나나, 자연 1년 노출 ≈ 3만 개. 단 K-40은 체내 항상성으로 유지되어 바나나를 많이 먹어도 누적되지 않습니다.',
              },
              {
                q: '후쿠시마 처리수 방류는 위험한가요?',
                a: '<strong>한국 원자력안전위원회·IAEA는 일상에 미치는 영향이 무시할 수준이라고 평가</strong>합니다(IAEA 종합보고서 2023). 방류 전 ALPS로 삼중수소 외 대부분의 핵종을 제거하고 희석해 방류하며, 한국원자력연구원·한국해양과학기술원 시뮬레이션은 10년 후 한국 해역의 삼중수소 <strong>농도 증가를 국내 해역 평균의 약 10만분의 1 수준(≈0.001 Bq/㎥)</strong>으로 추정했습니다 — 이에 따른 추가 피폭선량은 자연 방사선의 지역별 차이에 비해서도 무시할 수준이에요. 원안위는 방류 개시 후 국내 해역 방사능을 상시 감시·공개하고 있으며, 장기 모니터링이 필요하다는 데는 과학계도 동의합니다.',
              },
              {
                q: '휴대폰 SAR이 1.6 W/kg을 넘으면 위험한가요?',
                a: '<strong>SAR 한도는 인체 영향이 확인된 수준보다 크게 낮춰 잡은 값</strong>입니다. 국제 기준(ICNIRP)은 동물 실험에서 체온 상승에 따른 행동 변화가 나타난 전신 평균 SAR 4 W/kg을 출발점으로 일반인 전신 한도를 그 1/50인 0.08 W/kg으로 정했고, 머리·몸통 국소 한도(한국·미국 1.6 W/kg·1g 평균, EU 2.0 W/kg·10g 평균)도 같은 보호 체계 안에서 정한 값이에요. 시판되는 모든 휴대폰은 한도 이하이며, 한도를 살짝 넘어도 즉각 위험은 없습니다. 더 줄이고 싶다면 이어폰·스피커폰 사용, 통화 중 머리에서 1cm 떼기 등이 효과적입니다.',
              },
              {
                q: '송전선 근처에 사는 게 암 위험을 높이나요?',
                a: 'WHO·IARC는 극저주파(ELF) 자기장을 <strong>2B 등급(가능성 있음)</strong>으로 분류하지만, 대부분 연구에서 일상 노출 수준의 송전선 자기장은 명확한 인과관계가 확인되지 않았습니다. 한국전력 전국 실측 기준 <strong>154 kV 직하 평균 약 0.7 μT</strong>로 한국 기준(83.3 μT)의 1% 수준이에요. 다만 만성 노출 영향에 대한 연구는 계속되고 있어 가능하면 일정 거리를 두는 게 권장됩니다.',
              },
            ]

export default function RadiationPage() {
  return (
    <ToolPage width={880} slug="/tools/unit/radiation">
      <h1 className="tp-h1">
        <ToolIconBadge catId="unit" />방사선·전자파 단위 변환기
      </h1>
      <p className="tp-lead">
        <strong style={{ color: 'var(--text)' }}>Sv·rem·Gy·rad·Bq·Ci</strong> 동시 환산 + μSv/h ↔ mSv/년 + CT·치과·항공 일상 노출 비교 + EMF 참고치.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="단위 환산은 SI·ICRP 정의 기준. 일상 노출 비교값(CT·항공·자연 노출)과 EMF 참고치는 아래 공식 출처의 발표값을 정리한 참고용 대표치입니다."
        sources={[
          { label: '원자력안전위원회', href: 'https://www.nssc.go.kr' },
          { label: 'ICRP', href: 'https://www.icrp.org' },
          { label: '한국천문연구원', href: 'https://www.kasi.re.kr' },
          { label: '국가법령정보센터 원자력안전법 시행령', href: 'https://www.law.go.kr/법령/원자력안전법시행령' },
          { label: '식품의약품안전처', href: 'https://www.mfds.go.kr' },
        ]}
      />

      <RadiationClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 3가지 측정 단위 개요 */}
        <section>
          <h2 className="g-h2">3가지 방사선 측정 단위 — 무엇이 다른가</h2>
          <p className="g-p">
            방사선은 측정 관점에 따라 단위가 다릅니다 — <strong style={{ color: 'var(--text)' }}>방사능(얼마나 방출)</strong>, <strong style={{ color: 'var(--text)' }}>흡수선량(물질이 흡수)</strong>, <strong style={{ color: 'var(--text)' }}>유효선량(인체 영향)</strong>.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['관점', 'SI 단위', '구 단위', '의미'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['방사능 (활성도)',  'Bq (베크렐)', 'Ci (큐리)', '초당 붕괴 횟수. 1 Ci = 3.7×10¹⁰ Bq (라듐 1g 활성도)'],
                  ['흡수선량',        'Gy (그레이)', 'rad (라드)', '물질이 흡수한 에너지. 1 Gy = 1 J/kg = 100 rad'],
                  ['유효선량',        'Sv (시버트)', 'rem (렘)',  '인체 영향(전신 위험) 가중치 반영. 1 Sv = 100 rem'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>{row[2]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="분야별로 쓰는 단위">
            일상에서 가장 많이 쓰는 단위는 <strong>μSv·mSv</strong>입니다(인체 노출량). 식품 검사에서는 <strong>Bq/kg</strong>(킬로그램당 방사능). 방사선 치료에서는 <strong>Gy</strong>(흡수선량).
          </Callout>
        </section>

        {/* 2. 일상 노출 가이드 */}
        <section>
          <h2 className="g-h2">일상 노출 — 한국인 평균 vs 의료·여행</h2>
          <p className="g-p">
            한국인 평균 자연 방사선 노출은 <strong style={{ color: 'var(--text)' }}>약 3 mSv/년</strong>(라돈·우주선·식이 포함). 의료 영상이 가장 큰 인공 노출원이며, 항공 여행이 그 다음입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🌍 자연 노출 (한국 평균)', d: '3 mSv/년', desc: '라돈 등 흡입이 최대 기여 + 토양·우주선·식품 (구성비는 지역·지질별 편차)', c: 'var(--success)' },
              { t: '🏥 의료 영상 평균',       d: '2~3 mSv/년', desc: 'CT 1회면 자연 노출의 1~3년치, 일반 X-ray는 부위에 따라 며칠~몇 달치', c: 'var(--cat-health)' },
              { t: '🛫 항공 (장거리)',        d: '≈0.08 mSv/편도', desc: '인천→뉴욕 편도 0.08 · 왕복 0.15~0.17 mSv (한국천문연구원), 승무원은 연 1.5~3 mSv', c: 'var(--cat-dev)' },
              { t: '☢️ 일반인 인공 한도',      d: '1 mSv/년 (자연 제외)', desc: 'ICRP·원안위 권고 — CT 등 의료 피폭에는 이 한도가 적용되지 않음', c: 'var(--warning)' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderLeft: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
                <p style={{ fontSize: 16, color: 'var(--text)', fontWeight: 800, margin: '0 0 6px', fontFamily: 'var(--font-sans)' }}>{g.d}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2b. 노출률 ↔ 연간 선량 */}
        <section>
          <h2 className="g-h2">노출률(μSv/h)을 연간 선량으로 — 계산법과 읽는 법</h2>
          <p className="g-p">
            측정기나 환경방사선 전광판이 보여 주는 값은 대부분 <strong>시간당 노출률(μSv/h)</strong>입니다. 도구의 노출률 카드는 이 값에 24시간과 365일을 곱해
            하루·1년 누적으로 바꿉니다(1년 = 8,760시간). 기본값 0.12 μSv/h를 넣으면 하루 {trim(DEFAULT_RATE.usv_day, 2)} μSv,
            1년 {trim(DEFAULT_RATE.msv_year, 2)} mSv가 나옵니다. 아래 표도 같은 계산식으로 만든 값입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['노출률', '하루 누적', '1년 누적 (8,760시간)', '참고'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RATE_ROWS.map((r, i) => {
                  const c = convertRate(r.v, 'usv_h')
                  return (
                    <tr key={r.v} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.v} μSv/h</td>
                      <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{trim(c.usv_day, 2)} μSv</td>
                      <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{trim(c.msv_year, 2)} mSv</td>
                      <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{r.note}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            이 숫자를 읽을 때 흔히 하는 실수가 세 가지 있습니다. 첫째, <strong>자연 배경을 1년으로 환산한 값을 일반인 한도(1 mSv)와 비교하는 것</strong>입니다.
            1 mSv 한도는 자연 방사선과 의료 피폭을 뺀 &lsquo;인공 추가분&rsquo;에 대한 기준이라, 배경 0.12 μSv/h가 1년에 1 mSv를 넘는다고 해서 한도 초과가 아닙니다.
            둘째, 측정기 값으로 계산한 연간 선량이 한국인 평균 3 mSv보다 작게 나오는 것은 정상입니다. 휴대용 측정기는 몸 밖에서 들어오는 감마선(외부 피폭)만 재고,
            자연 노출에서 비중이 큰 라돈 흡입과 음식 섭취(내부 피폭)는 잡지 못합니다. 셋째, 8,760시간은 그 자리에 1년 내내 머문다는 최대 가정입니다.
            항공기 내부 5 μSv/h를 그대로 1년으로 바꾸면 {trim(FLIGHT_YEAR, 1)} mSv가 되지만, 승객이 실제로 받는 양은 노출률 × 비행시간입니다.
            측정기마다 교정 상태와 에너지 응답이 달라 같은 장소에서도 값이 다를 수 있으니, 평상시보다 뚜렷하게 높은 값이 반복되면 원자력안전위원회·한국원자력안전기술원이 공개하는 국가환경방사선 측정값과 비교해 보세요.
          </p>
        </section>

        {/* 2c. Gy·Bq → Sv */}
        <section>
          <h2 className="g-h2">Gy·Bq를 Sv로 바로 바꿀 수 없는 이유</h2>
          <p className="g-p">
            도구가 유효선량(Sv·rem), 흡수선량(Gy·rad), 방사능(Bq·Ci)을 서로 다른 카드로 나누고 같은 계열 안에서만 환산하는 것은 계열 사이에 고정된 환산 계수가 없기 때문입니다.
            흡수선량(Gy)에 방사선 종류별 <strong>방사선가중치 w<sub>R</sub></strong>를 곱하면 장기의 등가선량(Sv)이 되고, 여기에 장기별 <strong>조직가중치 w<sub>T</sub></strong>를
            곱해 합산해야 전신 위험을 나타내는 유효선량(Sv)이 됩니다. 아래는 ICRP 2007년 권고(Publication 103)의 방사선가중치입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['방사선 종류', '방사선가중치 w_R', '1 Gy 흡수 시 등가선량'].map(h => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['광자 (X선·감마선)', '1', '1 Sv'],
                  ['전자·뮤온 (베타선 포함)', '1', '1 Sv'],
                  ['양성자·하전 파이온', '2', '2 Sv'],
                  ['알파입자·핵분열 파편·중이온', '20', '20 Sv'],
                  ['중성자', '에너지에 따른 연속 함수 (약 2.5~21)', '약 2.5~21 Sv'],
                ].map((row, i) => (
                  <tr key={row[0]} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--text)' }}>{row[1]}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            그래서 &lsquo;1 Gy = 1 Sv&rsquo;는 <strong>X선·감마선이 몸 전체에 고르게 닿았을 때</strong>만 성립하는 어림입니다. 치과 X선처럼 일부만 찍으면 그 부위 흡수선량이 커도
            조직가중치(예: 갑상선 0.04, 침샘·피부 0.01)가 작게 반영돼 유효선량은 수~십수 μSv에 그칩니다. 반대로 급성 방사선 증후군 같은 고선량 영향은 유효선량이 아니라
            흡수선량(Gy)으로 평가하는 것이 원칙이라, 비교표의 1 Sv·4.5 Sv 항목은 감마선 전신 피폭을 가정한 어림값으로 읽어야 합니다.
          </p>
          <p className="g-p">
            방사능(Bq)에서 선량(Sv)으로 가려면 핵종·섭취 경로·나이에 따라 정해진 <strong>선량환산계수(Sv/Bq)</strong>가 필요합니다. 예를 들어 성인이 세슘-137을 먹었을 때의
            계수는 ICRP 72 기준 1.3×10⁻⁸ Sv/Bq입니다. 국내 식품의 방사성 세슘 기준(100 Bq/kg)에 딱 걸리는 식품 1kg을 먹으면 100 Bq × 1.3×10⁻⁸ = 약 1.3 μSv,
            도구의 바나나 등가량(0.1 μSv)으로 약 13개 분량입니다. 같은 100 Bq라도 핵종과 경로가 다르면 계수가 수십 배 이상 달라지므로, Bq 수치만 보고 위험을 비교하지 마세요.
          </p>
        </section>

        {/* 3. 이온화 vs 비이온화 */}
        <section>
          <h2 className="g-h2">이온화 방사선 vs 비이온화 전자파</h2>
          <p className="g-p">
            &ldquo;방사선&rdquo;과 &ldquo;전자파&rdquo;는 일상에서 혼용되지만 물리적으로 매우 다른 영역입니다. 본 도구의 단위 환산은 <strong style={{ color: 'var(--text)' }}>이온화 방사선</strong>(에너지가 원자에서 전자를 떼어낼 만큼 큰)에만 적용됩니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              {
                t: '⚛️ 이온화 방사선 (Ionizing)',
                desc: '알파·베타·감마·X-ray·중성자. DNA 손상 가능. 단위: Sv·Gy·Bq. 원전·의료영상·방사선치료·자연 방사능(라돈·우라늄).',
                c: 'var(--danger)',
              },
              {
                t: '📡 비이온화 전자파 (Non-ionizing)',
                desc: '전파·마이크로파·적외선·가시광·일부 자외선. 열·자극 정도 가능. 단위: V/m·W/kg(SAR)·μT. 휴대폰·WiFi·송전선·전자레인지.',
                c: 'var(--cat-art)',
              },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ fontSize: 14, color: g.c, fontWeight: 700, margin: '0 0 6px' }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.desc}</p>
              </div>
            ))}
          </div>
          <Callout tone="note" title="발암성 등급은 위험의 크기가 아니라 근거의 확실성">
            WHO·IARC 기준 휴대폰 RF는 발암성 등급 <strong>2B</strong>(가능성 있음 — 절임채소·아스파탐과 같은 등급), 이온화 방사선은 <strong>1</strong>(확실한 발암 물질). 절대적 위험도가 다릅니다. (커피는 2016년 IARC가 2B에서 해제해 더 이상 이 등급이 아니에요.)
          </Callout>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 함께 쓰면 좋은 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {[
              { href: '/tools/unit/hardness',       icon: '🛠️', name: '경도 변환기',     desc: 'HRC·HV·HB 강철 경도' },
              { href: '/tools/unit/viscosity',      icon: '🛢️', name: '점도 변환기',     desc: 'cP·cSt·SAE 윤활유' },
              { href: '/tools/unit/brewing',        icon: '🍺', name: '양조 도수·당도',   desc: 'Brix·SG·ABV·Proof' },
              { href: '/tools/unit/converter',      icon: '📐', name: '단위 변환기',      desc: '길이·무게·부피 일반' },
              { href: '/tools/health/uv-protection', icon: '☀️', name: '자외선 지수',    desc: 'UV·SPF 일광화상 시간' },
              { href: '/tools/edu/cosmic-calendar', icon: '🌌', name: '우주 달력',       desc: '138억년 압축 타임라인' },
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
