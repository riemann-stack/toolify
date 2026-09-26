import Link from 'next/link'
import PlanetComparisonClient from './PlanetComparisonClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Callout from '@/components/Callout'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import ToolPage from '@/components/ToolPage'
import { PLANETS, earthDistance, fmtDistance, fmtLightTime, fmt, round, type Planet } from './planetData'

export const metadata = buildMetadata({
  path: '/tools/edu/planet-comparison',
  title: '행성 비교 계산기 — 다른 행성에서 내 몸무게·나이·하루',
  description: '수성·금성·화성·목성 등 8개 행성에서 내 몸무게·나이·하루 길이가 어떻게 달라지는지 계산하는 교육용 시뮬레이터. 행성별 중력·공전주기·표면 온도 비교표와 2026년 행성 탐사 현황까지 한 페이지에.',
  keywords: ['행성비교', '태양계행성', '화성에서몸무게', '목성중력', '행성나이', '행성크기비교', '태양계시각화', '행성과학'],
})

/* 안내 표 — 손으로 적지 않고 도구와 같은 planetData(NASA Planetary Fact Sheet)와 같은 식으로 빌드 시 계산한다.
   도구 기본값: 체중 75kg · 나이 35세 · 지구 점프 50cm · g₀ = 9.80665 m/s² */
const REF_KG = 75
const REF_AGE = 35
const G0 = 9.80665
const MARS = PLANETS.find(p => p.id === 'mars')!
const marsAge = round((REF_AGE * 365.25) / MARS.yearDays, 1)

const yearLabel = (p: Planet) =>
  p.yearDays < 1000 ? `${fmt(p.yearDays, 0)}일` : `${fmt(p.yearDays, 0)}일 (${round(p.yearDays / 365.25, 1)}년)`
const hoursLabel = (h: number) => (h >= 48 ? `${fmt(round(h / 24, 1), 1)}일` : `${round(h, 1)}시간`)

const TH: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '10px 12px', color: 'var(--text)', whiteSpace: 'nowrap' }
const zebra = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

const FAQ_LD = [
              {
                q: '화성에서 내 몸무게가 더 가벼운 이유는?',
                a: '화성의 중력은 <strong>지구의 약 38%</strong>이기 때문입니다. 화성은 지구보다 작고(반지름 53%) 가벼워서(질량 11%) 표면 중력이 약합니다. 지구에서 체중계가 75kg을 가리키는 사람이 화성에 체중계를 가져가면 <strong>약 28.3kg</strong>을 가리킵니다. 다만 <strong>질량 75kg 자체는 그대로</strong>이고, 달라지는 것은 중력이 당기는 힘(무게)입니다 — 지구에서 736N이던 것이 화성에서는 277N이 됩니다.',
              },
              {
                q: '목성에서 1년이 12년이라는 게 무슨 뜻인가요?',
                a: '행성의 "1년"은 그 행성이 <strong>태양을 한 바퀴 도는 시간</strong>을 의미합니다. 목성은 태양에서 매우 멀리 있어 한 바퀴 도는 데 약 4,333일(12년)이 걸립니다. 따라서 지구에서 12살인 어린이는 목성에서는 1살밖에 안 된 셈입니다. 해왕성은 더 멀어서 1년이 약 165년으로, 해왕성에서 1년을 사는 사람은 지구 시간으로 165살이 됩니다.',
              },
              {
                q: '다른 행성에서 점프하면 얼마나 높이 뛸 수 있나요?',
                a: '같은 속도로 뛰어오른다고 가정하면 점프 높이는 <strong>표면 중력에 반비례</strong>합니다(h = v² ÷ 2g). 지구에서 50cm 점프할 수 있다면: 수성 약 1.32m·화성 약 1.33m(중력 약 0.38배, 지구의 약 2.6배), 달(중력 약 0.165배) 약 3.0m(지구의 약 6배), 목성(중력 2.36배) 약 21cm(지구의 약 42%)입니다. 실제로는 우주복 무게와 발 디딤이 달라져 이보다 낮게 뛰게 되며, 목성은 단단한 표면이 없어 설 곳 자체가 없습니다.',
              },
              {
                q: '인간이 다른 행성에서 살 수 있나요?',
                a: '<strong>현재 기술로는 어떤 행성에서도 보호 장비 없이 생존할 수 없습니다.</strong> 수성·금성은 극단적 온도(427°C, 464°C), 화성은 산소 부족·대기압이 지구의 1% 미만(약 0.6%)·평균 -65°C, 목성·토성·천왕성·해왕성은 가스·얼음 거대 행성으로 단단한 표면이 없습니다. 가장 많이 거론되는 후보는 <strong>화성</strong>으로, NASA·SpaceX 등이 유인 탐사와 정착 기술을 연구 중입니다. 단, 우주복·돔·온실 등 인공 환경이 필수적입니다.',
              },
              {
                q: '빛 도달 시간이란 무엇인가요?',
                a: '빛이 한 행성에서 다른 행성까지 가는 데 걸리는 시간입니다. 빛의 속도는 1초에 약 30만 km로 우주에서 가장 빠르지만, 행성 간 거리가 워낙 멀어 시간이 걸립니다. 화성에 메시지를 보내면 두 행성의 위치에 따라 <strong>편도 약 3~22분</strong>이 걸립니다(가장 가까이 접근할 때 ~ 태양 반대편일 때). 이 때문에 화성 탐사선과 실시간 조작이 불가능하고, 명령을 보내 응답을 받기까지 왕복 약 6~44분이 필요합니다. 도구는 궤도를 원으로 근사하므로 편도 4.4~21분으로 조금 좁게 나옵니다. 해왕성까지는 약 4시간, 가장 가까운 별 (프록시마 센타우리)까지는 4.2년이 걸립니다.',
              },
            ]

export default function PlanetComparisonPage() {
  return (
    <ToolPage width={760} slug="/tools/edu/planet-comparison">
      <h1 className="tp-h1">
        <ToolIconBadge catId="edu" />행성 비교 계산기
      </h1>
      <p className="tp-lead">
        8개 행성에서 <strong style={{ color: 'var(--text)' }}>내 몸무게·나이·하루 길이</strong>가 어떻게 달라지는지 시각화.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="행성 물리량 = NASA Planetary Fact Sheet(표면 중력·공전주기·항성일·태양일·1bar 기준 온도) · 체중계 눈금 = 체중 × 표면중력비 · 행성 나이 = 나이 × 365.25 ÷ 공전일수 · 지구–행성 거리는 원궤도·동일 평면 근사 · 탐사 현황은 각 기관 발표 기준"
        sources={[
          { label: 'NASA Planetary Fact Sheet (NSSDCA)', href: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
          { label: 'NASA Science — Planets', href: 'https://science.nasa.gov/solar-system/planets/' },
          { label: 'ESA — BepiColombo', href: 'https://www.esa.int/Science_Exploration/Space_Science/BepiColombo' },
          { label: 'NASA — Europa Clipper', href: 'https://science.nasa.gov/mission/europa-clipper/' },
          { label: 'NASA — Juno', href: 'https://science.nasa.gov/mission/juno/' },
          { label: 'ESA — Juice', href: 'https://www.esa.int/Science_Exploration/Space_Science/Juice' },
        ]}
      />

      <PlanetComparisonClient />

      {/* 본문 광고 */}
      <AdSlot position="in-article" minHeight={200} />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 태양계 8개 행성 ── */}
        <div>
          <h2 className="g-h2">
            태양계 8개 행성 한눈에
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '지구형 행성',     c: 'var(--cyan-600)', d: '수성·금성·지구·화성 — 작고 단단한 암석질 행성' },
              { t: '거대 가스 행성',  c: 'var(--orange-600)', d: '목성·토성 — 수소·헬륨이 주성분, 단단한 표면 없음' },
              { t: '거대 얼음 행성',  c: 'var(--teal-600)', d: '천왕성·해왕성 — 물·메탄·암모니아 같은 휘발성 물질이 풍부' },
              { t: '왜소행성',        c: 'var(--gray-400)', d: '명왕성은 2006년 IAU 총회에서 왜소행성으로 재분류' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: `3px solid ${g.c}`, borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 6 }}>{g.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{g.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 몸무게 변화 원리 ── */}
        <div>
          <h2 className="g-h2">
            각 행성에서 몸무게 변화 원리
          </h2>
          <p className="g-p">
            먼저 <strong>질량과 무게는 다른 것</strong>입니다. 질량(kg)은 물질의 양이라 어느 행성에 가도 그대로이고, 무게는 중력이 그 질량을 당기는 힘이라 행성마다 달라집니다. 무게의 단위는 원래 <strong>뉴턴(N)</strong>이에요.
          </p>
          <p className="g-p">
            그런데 우리가 쓰는 체중계는 힘을 재고서 <strong>지구 중력으로 나눈 값</strong>을 kg으로 보여 줍니다. 그래서 &ldquo;화성에서 28.3kg&rdquo;은 정확히 말하면 <strong>화성에 체중계를 가져가면 눈금이 28.3을 가리킨다</strong>는 뜻이지, 질량이 줄어든다는 뜻이 아닙니다. 이 도구가 &lsquo;체중계 눈금&rsquo;과 &lsquo;무게(N)&rsquo;를 나눠 보여 주는 이유입니다.
          </p>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-m)',
            padding: '18px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>무게(W)</span> = <span style={{ color: 'var(--muted)' }}>질량(m)</span> × <span style={{ color: 'var(--muted)' }}>중력 가속도(g)</span></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>지구에서 75kg → 무게 75 × 9.81 = <strong style={{ color: 'var(--text)' }}>736 N</strong></div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>화성에서는 75 × 3.70 = <strong style={{ color: 'var(--text)' }}>277 N</strong> → 체중계는 <strong style={{ color: 'var(--text)' }}>28.3kg</strong>을 가리킴</div>
          </div>
          <div className="tableScroll" style={{ marginTop: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <caption style={{ captionSide: 'bottom', textAlign: 'left', fontSize: 12, color: 'var(--muted)', paddingTop: 8 }}>
                질량 {REF_KG}kg · 지구 제자리 점프 50cm 기준. 도구와 같은 표면중력비(NASA)로 계산했습니다.
              </caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['행성', '표면중력 (지구=1)', '체중계 눈금', '무게', '점프 높이'].map(h => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLANETS.map((p, i) => (
                  <tr key={p.id} style={zebra(i)}>
                    <td style={{ ...TD, fontWeight: 700 }}>{p.name}</td>
                    <td style={TD}>{p.gravityRatio.toFixed(3)} g</td>
                    <td style={{ ...TD, color: 'var(--teal-600)', fontWeight: 700 }}>{(REF_KG * p.gravityRatio).toFixed(1)} kg</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{fmt(round(REF_KG * p.gravityRatio * G0))} N</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{(0.5 / p.gravityRatio).toFixed(2)} m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            눈여겨볼 점은 <strong>크기와 중력이 비례하지 않는다</strong>는 것입니다. 토성은 반지름이 지구의 9배가 넘지만 표면중력은 지구보다 약하고, 천왕성도 0.9배 수준입니다.
            표면중력은 질량 ÷ 반지름²에 비례하는데, 거대 행성은 부피에 비해 밀도가 낮아 반지름이 커진 효과가 질량 증가를 상당 부분 상쇄하기 때문입니다.
            다만 토성은 질량 ÷ 반지름²만 따지면 적도에서도 지구보다 약간 큰 값(약 1.06배)이 나옵니다. NASA 표의 표면중력은 1bar 높이의 적도에서 자전 효과까지 포함한 값이라, 약 10.7시간에 한 바퀴 도는 빠른 자전의 원심력만큼 줄어든 것입니다 — 토성이 지구보다 약간 약하게 나오는 것은 주로 이 효과 때문입니다.
            또 거대 행성의 &lsquo;표면&rsquo;은 단단한 땅이 아니라 대기압이 1bar인 높이를 기준으로 삼은 값입니다.
          </p>
        </div>

        {/* ── 3. 1년·1일 길이 ── */}
        <div>
          <h2 className="g-h2">
            행성 1년·1일의 길이
          </h2>
          <p className="g-p">
            &lsquo;1년&rsquo;은 태양을 한 바퀴 도는 공전주기이고, 도구의 행성 나이는 <strong>지구 나이 × 365.25 ÷ 그 행성의 공전일수</strong>로 구합니다.
            예를 들어 {REF_AGE}세는 화성에서 {REF_AGE} × 365.25 ÷ {fmt(MARS.yearDays, 2)} ≈ <strong>{marsAge}세</strong>입니다.
            &lsquo;하루&rsquo;는 두 가지로 셀 수 있습니다. 별을 기준으로 한 바퀴 도는 <strong>항성일</strong>과, 해가 다시 같은 자리에 올 때까지의 <strong>태양일</strong>입니다.
            공전하는 동안 해의 방향이 바뀌기 때문에 둘은 다르며, 자전이 느린 수성·금성에서는 그 차이가 극단적으로 커집니다. 도구의 &lsquo;하루&rsquo;는 생활 감각에 맞는 태양일입니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['행성', '1년 (공전주기)', '하루 (태양일)', '자전 (항성일)', `지구 ${REF_AGE}세 →`].map(h => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLANETS.map((p, i) => (
                  <tr key={p.id} style={zebra(i)}>
                    <td style={{ ...TD, fontWeight: 700 }}>{p.name}</td>
                    <td style={TD}>{yearLabel(p)}</td>
                    <td style={{ ...TD, color: 'var(--teal-600)', fontWeight: 700 }}>{hoursLabel(p.solarDayHours)}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{hoursLabel(p.rotationHours)}{p.isRetrograde ? ' · 역행' : ''}</td>
                    <td style={{ ...TD, color: 'var(--muted)' }}>{round((REF_AGE * 365.25) / p.yearDays, 1)}세</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Callout tone="note" title="특별한 점">
            금성은 자전 방향이 공전과 반대(역행)라 해가 서쪽에서 뜹니다. 별 기준 자전(243일)이 공전(225일)보다 길지만, 해가 다시 뜨는 태양일은 약 117일입니다.
            천왕성은 자전축이 98° 기울어져 옆으로 누운 채 공전합니다.
          </Callout>
        </div>

        {/* ── 4. 빛 도달 시간 ── */}
        <div>
          <h2 className="g-h2">
            빛이 행성까지 도달하는 시간
          </h2>
          <p className="g-p">
            빛의 속도는 정의값 <strong>299,792.458 km/s</strong>(약 30만 km/초)입니다. 도구는 지구와 행성의 궤도를 원으로 보고, 가장 가까울 때를 두 궤도 반지름의 차,
            태양 반대편에 있을 때를 합으로 잡아 거리 ÷ 광속으로 신호 시간을 구합니다. 달까지는 평균 약 38만 km라 1.3초 남짓, 태양계 밖 가장 가까운 별인 프록시마 센타우리까지는 약 4.2년이 걸립니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['행성', '가장 가까울 때', '가장 멀 때', '빛 편도'].map(h => (
                    <th scope="col" key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLANETS.filter(p => p.id !== 'earth').map((p, i) => {
                  const d = earthDistance(p)
                  return (
                    <tr key={p.id} style={zebra(i)}>
                      <td style={{ ...TD, fontWeight: 700 }}>{p.name}</td>
                      <td style={TD}>{fmtDistance(d.minKm)}</td>
                      <td style={TD}>{fmtDistance(d.maxKm)}</td>
                      <td style={{ ...TD, color: 'var(--teal-600)', fontWeight: 700 }}>{fmtLightTime(d.minLightMin)} ~ {fmtLightTime(d.maxLightMin)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            원궤도 근사이므로 실제 값과는 조금 다릅니다. 궤도가 찌그러진 정도(이심률)가 큰 수성은 실제로 약 7,700만 km까지 가까워지고, 화성도 가장 가까운 접근 때는 5,500만 km대까지 좁혀집니다.
            표는 &lsquo;대략 몇 분이 걸리는가&rsquo;를 가늠하는 용도로 보세요.
          </p>
          <Callout tone="warn" title="화성 탐사선과의 통신">
            신호가 편도 약 3~22분(도구의 원궤도 근사로는 4.4~21분) 걸려 실시간 조종이 불가능하고, 명령을 보내 응답을 받기까지 왕복 약 6~44분이 걸립니다. 그래서 로버는 미리 짠 명령을 묶음으로 받아 자율 주행 기능을 섞어 수행합니다.
          </Callout>
        </div>

        {/* ── 5. 표면 온도 ── */}
        <div>
          <h2 className="g-h2">
            각 행성 표면 온도
          </h2>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['행성', '온도 범위', '평균', '특징'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : (i <= 2 ? 'right' : 'left'), color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { p: '수성', r: '-173~427°C', avg: '167°C',  d: '극단적 변화 (대기가 거의 없음)' },
                  { p: '금성', r: '464°C',       avg: '464°C', d: '가장 뜨거움 — 두꺼운 CO2 대기' },
                  { p: '지구', r: '-89~56.7°C',  avg: '15°C',  d: '생명체 거주 가능' },
                  { p: '화성', r: '-143~35°C',   avg: '-65°C', d: '추움 · 얇은 CO2 대기' },
                  { p: '목성', r: '-110°C',       avg: '-110°C', d: '가스 행성 — 1bar 높이 기준' },
                  { p: '토성', r: '-140°C',       avg: '-140°C', d: '가스 행성 — 1bar 높이 기준' },
                  { p: '천왕성', r: '-195°C',      avg: '-195°C', d: '최저 -224°C 관측' },
                  { p: '해왕성', r: '-200°C',      avg: '-200°C', d: '평균 기온이 가장 낮음' },
                ].map((r, i) => (
                  <tr key={i} style={zebra(i)}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>{r.r}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--teal-600)', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>{r.avg}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 12 }}>
            금성이 태양에 더 가까운 수성보다 뜨거운 이유는 <strong>두꺼운 이산화탄소 대기가 만드는 극심한 온실효과</strong>입니다. 금성의 대기압은 지구의 약 90배라 낮과 밤, 적도와 극의 온도 차도 거의 없습니다.
            반대로 대기가 거의 없는 수성은 열을 붙잡아 두지 못해 낮과 밤의 차이가 600°C에 이릅니다.
          </p>
        </div>

        {/* ── 6. 행성 탐사 ── */}
        <div>
          <h2 className="g-h2">
            행성 탐사 현황 (2026년)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {[
              { t: '수성', d: '메신저호 2011~2015년 궤도 운용 후 종료 · 베피콜롬보 순항 중, 2026년 11월 궤도 진입 예정', c: 'var(--gray-400)' },
              { t: '금성', d: '비너스 익스프레스 2014년 종료 · 아카츠키 2025년 9월 운용 종료 → 현재 금성 궤도에 가동 중인 탐사선 없음', c: 'var(--amber-600)' },
              { t: '화성', d: '큐리오시티·퍼서비어런스 활동 중 (인저뉴어티 헬기는 2024년 1월 72회 비행 후 임무 종료)', c: 'var(--red-600)' },
              { t: '목성', d: '주노는 2016년부터 목성 궤도를 돌며 관측해 왔고, 발표된 연장 임무 기간은 2025년 9월까지 — 이후 운용 여부는 NASA 임무 페이지 확인 · Europa Clipper 순항 중(2030년 도착 예정) · ESA JUICE 순항 중(2031년 도착 예정)', c: 'var(--orange-600)' },
              { t: '토성', d: '카시니 (1997-2017 종료, 데이터 분석 진행)', c: 'var(--yellow-700)' },
              { t: '천왕성·해왕성', d: '보이저 2호만 1986/1989년 근접 통과', c: 'var(--teal-600)' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${c.c}`, borderRadius: 'var(--radius-m)', padding: '12px 14px' }}>
                <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 700, marginBottom: 4 }}>{c.t}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{c.d}</p>
              </div>
            ))}
          </div>
          <Callout tone="note" title="항행 중인 탐사선">
            <strong>Europa Clipper</strong>(NASA, 2024년 10월 발사, 2030년 목성 도착 예정), <strong>JUICE</strong>(ESA, 2023년 4월 발사, 2031년 목성 도착 예정), <strong>베피콜롬보</strong>(ESA·JAXA, 2026년 11월 수성 궤도 진입 예정)가 이미 발사돼 목적지로 가고 있습니다. 일정은 기관 발표에 따라 바뀔 수 있습니다.
          </Callout>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 7. FAQ ── */}
        <div>
          <Faq items={FAQ_LD} />
        </div>

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 className="g-h2">
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/unit/converter',      icon: '📐', name: '단위 변환기',         desc: '길이·무게·시간 등 14종 통합 변환' },
              { href: '/tools/edu/cosmic-calendar', icon: '🌌', name: '코스믹 캘린더',       desc: '138억 년 우주 역사를 1년으로' },
              { href: '/tools/edu/sound-speed',     icon: '🔊', name: '음속 계산기',         desc: '천둥·번개 거리·소리 도달 시간' },
              { href: '/tools/date/age',            icon: '🎂', name: '만 나이 계산기',      desc: '법 개정 기준 만 나이' },
              { href: '/tools/unit/area',           icon: '🏠', name: '평수 변환기',         desc: '아파트 면적 단위 변환' },
              { href: '/tools/edu',                 icon: '🔬', name: '교육·학습 카테고리',  desc: '추가 교육 도구 더보기' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-m)',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </ToolPage>
  )
}
