import Link from 'next/link'
import DehumidifierClient from './DehumidifierClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import { KEPCO_RESIDENTIAL_TIER_KRW, HOME_TYPES, ENV_FACTORS, PRODUCT_TIERS, DEFAULT_WON_PER_KWH, calcDehumidifier, pyeongToSqm } from './dehumidifierData'
import ToolPage from '@/components/ToolPage'
import Callout from '@/components/Callout'

export const metadata = buildMetadata({
  path: '/tools/interior/dehumidifier',
  title: '제습기 용량 계산기 — 평수별 리터·전기요금',
  description: '방·집 면적과 주거 유형으로 적정 제습량(L/day)과 권장 제품 용량을 계산. 지하·장마철 보정 + 월 소비전력·전기요금 추정까지.',
  keywords: [
    '제습기 용량 계산', '제습기 평수', '제습기 몇리터', '제습기 전기요금',
    '20평 제습기 용량', '아파트 제습기 용량', '지하 제습기', '장마 제습기',
  ],
})

/* ── 가이드 표·예시 — 빌드 시 dehumidifierData의 계수·등급·계산 함수로 생성 (손으로 옮겨 적지 않는다) ── */
const nf = (v: number, d = 0) => v.toLocaleString('ko-KR', { minimumFractionDigits: d, maximumFractionDigits: d })
const th: React.CSSProperties = { padding: '10px 12px', color: 'var(--muted)', fontWeight: 500, fontSize: 12, textAlign: 'right', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', textAlign: 'right', color: 'var(--text)', whiteSpace: 'nowrap' }
const rowBg = (i: number): React.CSSProperties => ({ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' })

/* 평수 × 주거 유형 조견표 (평상시 보정 ×1.0) */
const GRID_PYEONG = [5, 10, 15, 20, 25, 30, 40]
const GRID = GRID_PYEONG.map(py => ({
  py,
  cells: HOME_TYPES.map(h => calcDehumidifier(pyeongToSqm(py), h.coeff, 1, 6, DEFAULT_WON_PER_KWH)),
}))
/* 공식 예시: 20평 아파트 · 장마 */
const RAINY = ENV_FACTORS.find(e => e.id === 'rainy')!
const EX = calcDehumidifier(pyeongToSqm(20), HOME_TYPES[0].coeff, RAINY.mult, 6, DEFAULT_WON_PER_KWH)
/* 전기요금 예시: 위 예시 제품을 하루 6시간 · 30일 */
const RATE_ROWS = [
  { label: '누진 1단계 전력량요금', won: KEPCO_RESIDENTIAL_TIER_KRW.tier1 },
  { label: '계산기 기본 단가', won: DEFAULT_WON_PER_KWH },
  { label: '누진 2단계 전력량요금', won: KEPCO_RESIDENTIAL_TIER_KRW.tier2 },
  { label: '누진 3단계 전력량요금', won: KEPCO_RESIDENTIAL_TIER_KRW.tier3 },
]

const FAQ_LD = [
  {
    q: '20평 아파트에는 몇 리터 제습기가 필요한가요?',
    a: '20평(약 66㎡) 아파트는 하루 제거 수분량이 <strong>약 15L</strong>로, <strong>16L급 제품</strong>이 적당합니다. 평당 약 0.76L(업계 통용 가이드)로 계산하며, 장마철에는 한 단계 위(20L급)가 여유롭습니다. 제품의 표기 제습량은 정해진 시험 조건(국내 KS C 9317은 27℃·60%RH, 24시간)에서 잰 값이라 실제 방에서는 그보다 적게도, 많게도 나올 수 있으니, 계산값과 같거나 조금 큰 등급을 고르면 됩니다.',
  },
  {
    q: '제습기 정격 리터와 실제 제거량이 다른 이유는?',
    a: '제품에 표기된 <strong>정격 제습량(L/day)</strong>은 정해진 온도·상대습도에서 24시간 연속 운전했을 때의 시험값입니다. 컴프레서식 제습기는 공기가 덥고 습할수록 물을 많이 뽑고, 서늘하고 건조할수록 적게 뽑기 때문에 같은 16L 제품도 방의 조건에 따라 하루 제거량이 달라집니다. 또 설정 습도에 도달하면 압축기가 쉬므로 실제로 모이는 물은 대개 정격보다 적습니다. 제품을 비교할 때는 사양표에서 제습량 옆에 적힌 <strong>시험 조건(온도·습도)</strong>을 확인하고 같은 조건의 수치끼리 비교하세요.',
  },
  {
    q: '지하·반지하는 왜 용량을 더 크게 잡나요?',
    a: '지하·반지하는 <strong>지중(땅속) 습기가 벽·바닥으로 스며들어</strong> 같은 면적의 아파트보다 습기 유입이 큽니다. 본 계산기는 지하·반지하를 평당 기준을 높여(관행 보정값) 잡습니다. 곰팡이·결로가 심하다면 계산값보다 한 단계 큰 제품 + 24시간 약하게 상시 가동 + 환기를 병행하는 것이 효과적입니다.',
  },
  {
    q: '제습기 전기요금은 얼마나 나오나요?',
    a: '제습기 소비전력은 용량별로 <strong>150~440W</strong> 수준이고, 월 전력량은 소비전력 × 하루 가동시간 × 30일로 늘어납니다. 누진 구간별 월 요금 예시는 위 「월 전기요금은 이렇게 계산된다」 표를 참고하고, 계산기에서 하루 가동시간과 단가를 조절해 우리 집 기준으로 확인하세요.',
  },
  {
    q: '에어컨 제습 모드로 대체할 수 있나요?',
    a: '어느 정도 가능하지만 <strong>목적이 다릅니다.</strong> 에어컨 제습(제습냉방)은 실내를 시원하게 하면서 습기를 빼지만, 온도까지 낮아져 쌀쌀할 수 있고 넓은 거실 위주입니다. 제습기는 <strong>온도를 크게 낮추지 않고 습기만 집중</strong>해서 빼며, 옷장·신발장·빨래 건조처럼 좁고 밀폐된 공간, 겨울철 결로에도 효과적입니다. 장마철 눅눅함 제거·실내 빨래 건조는 제습기가, 한여름 무더위 냉방은 에어컨이 유리합니다.',
  },
  {
    q: '제습기 물을 매번 버려야 하나요?',
    a: '물통형은 <strong>가득 차면 자동으로 멈추고 알림</strong>이 오므로 그때 비우면 됩니다. 용량이 클수록·습할수록 자주 차므로, 장마철 지하실처럼 물이 빨리 차는 곳은 <strong>연속 배수(호스 연결)</strong> 기능이 있는 제품이 편합니다. 받은 물은 세탁·청소용으로 재사용할 수 있지만 식수·화초용으로는 권장하지 않습니다(공기 중 미세먼지·세균 포함 가능).',
  },
]

const RELATED = [
  { href: '/tools/interior/ac-capacity', icon: '❄️', name: '에어컨 평형 계산기', desc: '면적·향·층수로 추천 평형' },
  { href: '/tools/interior/ventilation', icon: '💨', name: '환기량 계산기', desc: '부피·인원으로 필요 환기량' },
  { href: '/tools/life/laundry-dry', icon: '🧺', name: '빨래 건조 시간 계산기', desc: '습도·온도별 건조 시간' },
  { href: '/tools/interior/room-area', icon: '📐', name: '공간 면적 계산기', desc: '벽·바닥·평수·부피' },
  { href: '/tools/cooking/food-storage', icon: '🥬', name: '식재료 보관 계산기', desc: '냉장·냉동 보관 기간' },
  { href: '/tools/unit/area', icon: '🏠', name: '평수 변환기', desc: '평↔㎡ 면적 변환' },
]

export default function DehumidifierPage() {
  return (
    <ToolPage width={760} slug="/tools/interior/dehumidifier">
      <h1 className="tp-h1">
        <ToolIconBadge catId="interior" />제습기 용량 계산기
      </h1>
      <p className="tp-lead">
        방·집 면적으로 <strong style={{ color: 'var(--text)' }}>적정 제습량(L/일)과 권장 제품 용량</strong> + 월 전기요금까지. 아파트·주택·지하·장마철 보정.
      </p>

      <UpdatedMeta
        date="2026년 9월"
        basis="한전 주택용(저압) 누진제 요금표 기준 — 소비전력은 국내 유통 제품 통상 범위"
        sources={[{ label: '한국전력 — 전기요금표(주택용)', href: 'https://cyber.kepco.co.kr/ckepco/front/jsp/CY/E/E/CYEEHP00101.jsp' }]}
      />

      <DehumidifierClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 공식 */}
        <section>
          <h2 className="g-h2">제습기 용량 계산 공식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)',
            padding: '18px 20px', fontFamily: 'var(--font-mono)',
            fontSize: '13px', color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>하루 제거 수분량(L)</span> = 면적(㎡) × 주거계수 × 습도보정</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>{HOME_TYPES.map(h => `${h.name} ${h.coeff}`).join(' · ')} (L/㎡·일)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>습도보정: {ENV_FACTORS.map(e => `${e.name} ×${e.mult}`).join(' · ')}</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            <strong style={{ color: 'var(--text)' }}>예시:</strong> 20평 아파트({nf(EX.areaSqm, 1)}㎡), 장마철<br />
            • 기본: {nf(EX.areaSqm, 1)} × {HOME_TYPES[0].coeff} = <strong>{nf(EX.areaSqm * HOME_TYPES[0].coeff, 1)}L</strong><br />
            • 보정: × {RAINY.mult}(장마) = <strong style={{ color: 'var(--accent-ink)' }}>{nf(EX.dailyLiters, 1)}L / 일</strong><br />
            • 매칭: 필요량 이상을 내는 가장 작은 등급 → <strong style={{ color: 'var(--accent-ink)' }}>{EX.tier.label}</strong> 제품
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            계산기는 하루 필요 제거량을 구한 뒤, 시판 등급({PRODUCT_TIERS.map(t => t.label).join('·')}) 가운데 표기 정격이 필요량 이상인 가장 작은 등급을 추천합니다. 필요량이 가정용 최대 등급(30L)을 넘으면 한 대로 무리하게 돌리지 않고 30L급 여러 대로 나눠 운용하도록 대수를 함께 보여 줍니다. 주거계수는 업계 통용 가이드(아파트 평당 0.76L·주택 1.02L)를 ㎡로 환산한 값이고, 지하 계수와 습도 보정은 측정 상수가 아니라 실사용 관행값입니다.
          </p>
        </section>

        {/* 2. 평수별 권장 용량 표 */}
        <section>
          <h2 className="g-h2">평수·주거 유형별 권장 제습기 용량</h2>
          <p className="g-p">
            아래 표는 계산기와 같은 공식으로 평상시(보정 ×1.0) 하루 필요 제거량과 추천 등급을 계산한 결과입니다. 장마철이면 ×1.25, 실내 빨래 건조를 병행하면 ×1.4만큼 필요량이 커지므로 한 단계 위 등급이 나올 수 있습니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ ...th, textAlign: 'left' }}>면적</th>
                  {HOME_TYPES.map(h => <th scope="col" key={h.id} style={th}>{h.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {GRID.map((r, i) => (
                  <tr key={r.py} style={rowBg(i)}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 700 }}>{r.py}평 ({nf(pyeongToSqm(r.py), 0)}㎡)</th>
                    {r.cells.map((c, j) => (
                      <td key={j} style={td}>
                        <span style={{ color: 'var(--muted)' }}>{nf(c.dailyLiters, 1)}L → </span>
                        <strong style={{ color: 'var(--accent-ink)' }}>{c.tier.label}{c.units > 1 ? ` ×${c.units}대` : ''}</strong>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-note">
            * 면적은 제습할 공간의 실면적입니다. 한 대로 집 전체를 맡기려면 방문을 열어 공기가 통하게 해야 하고, 방문을 닫고 쓰는 방은 그 방 면적만 넣어 따로 계산하세요.
          </p>
        </section>

        {/* 3. 전기요금 계산 */}
        <section>
          <h2 className="g-h2">월 전기요금은 이렇게 계산된다</h2>
          <p className="g-p">
            계산기의 월 전력량은 <strong>등급별 대표 소비전력(W) × 하루 가동시간 × 30일</strong>입니다. 위 예시의 {EX.tier.label}({EX.tier.watt}W)을 하루 6시간 돌리면 {EX.tier.watt}W × 6시간 × 30일 = <strong>{nf(EX.monthlyKwh, 1)}kWh</strong>가 늘어납니다. 여기에 곱하는 단가가 요금을 좌우하는데, 주택용 전기요금은 누진제라 이미 전기를 많이 쓰는 집일수록 추가분의 kWh당 단가가 올라갑니다.
          </p>
          <div className="tableScroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ ...th, textAlign: 'left' }}>적용 단가</th>
                  <th scope="col" style={th}>원/kWh</th>
                  <th scope="col" style={th}>월 추가요금 ({nf(EX.monthlyKwh, 1)}kWh)</th>
                </tr>
              </thead>
              <tbody>
                {RATE_ROWS.map((r, i) => (
                  <tr key={r.label} style={rowBg(i)}>
                    <th scope="row" style={{ ...td, textAlign: 'left', fontWeight: 600 }}>{r.label}</th>
                    <td style={td}>{nf(r.won, 1)}</td>
                    <td style={{ ...td, fontWeight: 700, color: 'var(--accent-ink)' }}>약 {nf(Math.round(EX.monthlyKwh * r.won / 10) * 10)}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            표의 금액은 전력량요금만 곱한 값으로 기본요금·기후환경요금·연료비조정요금·부가가치세·전력산업기반기금이 빠져 있습니다. 반대로 실제 제습기는 설정 습도에 도달하면 압축기를 멈추고 송풍만 하므로, 정격 소비전력으로 가동시간 내내 도는 것으로 본 이 계산은 요금을 넉넉하게 잡은 쪽에 가깝습니다. 우리 집이 누진 몇 단계인지는 지난달 고지서의 사용량(kWh)으로 확인할 수 있습니다.
          </p>
        </section>

        {/* 4. 방식 */}
        <section>
          <h2 className="g-h2">컴프레서식 vs 데시칸트식 — 계절에 따라 다르다</h2>
          <p className="g-p">
            가정용 제습기 대부분은 에어컨처럼 냉매로 차가운 코일을 만들어 공기 속 수증기를 물로 맺히게 하는 <strong>컴프레서식</strong>입니다. 덥고 습한 여름·장마철에 효율이 좋지만, 실내가 서늘한 겨울에는 코일에 맺히는 물이 줄어 제습량이 크게 떨어집니다. 압축기 열과 응결열이 방으로 나오기 때문에 가동 중 실내 온도가 조금 오르는 것도 정상입니다.
          </p>
          <p className="g-p">
            <strong>데시칸트식(제올라이트 등 흡착식)</strong>은 흡습재가 습기를 빨아들이고 히터로 다시 말려 물을 모으는 방식이라 낮은 온도에서도 제습량이 덜 떨어지고 압축기 소음이 없습니다. 대신 히터를 쓰므로 같은 제습량에 소비전력이 크고, 배출 공기가 따뜻합니다. 겨울 결로·옷장 제습이 주목적이면 데시칸트식, 여름 장마 대응이 주목적이면 컴프레서식이 맞습니다. 이 계산기의 소비전력은 컴프레서식 대표값이라 데시칸트식은 요금이 더 나올 수 있습니다.
          </p>
        </section>

        {/* 5. 제습기 vs 에어컨 제습 */}
        <section>
          <h2 className="g-h2">제습기 vs 에어컨 제습 모드 — 언제 무엇을</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent-ink)', fontWeight: 700, marginBottom: 8 }}>제습기가 유리</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>장마철 눅눅함·곰팡이 제거</li>
                <li>실내 빨래 건조 (급속 건조)</li>
                <li>옷장·신발장·드레스룸 밀폐공간</li>
                <li>겨울 결로·지하 습기</li>
                <li>온도를 낮추지 않고 습기만</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cat-health)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--cat-health)', fontWeight: 700, marginBottom: 8 }}>에어컨 제습이 유리</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>한여름 무더위 (냉방 겸용)</li>
                <li>넓은 거실 전체</li>
                <li>이미 에어컨이 있어 추가 구매 불필요</li>
                <li>시원함 + 습기 제거 동시</li>
              </ul>
            </div>
          </div>
          <Callout tone="tip">
            둘을 함께 쓰면 에어컨 설정온도를 1~2℃ 높여도 쾌적해 전기요금 절약에 도움이 됩니다.
          </Callout>
        </section>

        {/* 6. 전기요금·사용 팁 */}
        <section>
          <h2 className="g-h2">제습기 전기요금 아끼는 사용법</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '문·창 닫고 가동', items: ['밀폐 공간에서 제습 효율 최대', '가동 중 환기하면 습기 다시 유입', '방문 닫고 방 하나씩 집중'] },
              { t: '적정 습도 50~60%', items: ['너무 낮추면 전력 낭비·건조함', '습도 설정 기능으로 자동 유지', '빨래 건조는 40~50%'] },
              { t: '연속 배수 활용', items: ['물통 자주 비우기 번거로우면 호스 연결', '지하·장마철 상시 가동에 편리', '만수 정지로 밤새 멈추는 것 방지'] },
              { t: '필터·위치 관리', items: ['먼지 필터 2주마다 청소', '벽에서 20cm 이상 띄우기', '문틈·베란다 등 습기원 근처 배치'] },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{b.t}</p>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
                  {b.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p className="g-p" style={{ marginTop: 16 }}>
            제습기를 돌려도 벽지 뒤 곰팡이나 창가 결로가 계속된다면 용량보다 원인 문제일 가능성이 큽니다. 외벽 단열 불량·누수·배관 결로는 제습기로 해결되지 않으므로, 같은 자리에 얼룩이 반복되면 관리사무소나 누수 점검 업체에 먼저 확인을 받으세요.
          </p>
        </section>

        {/* 7. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 8. 관련 도구 */}
        <section>
          <h2 className="g-h2">함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-m)', textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </ToolPage>
  )
}
