import Link from 'next/link'
import DehumidifierClient from './DehumidifierClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/interior/dehumidifier',
  title: '제습기 용량 계산기 — 평수별 리터·전기요금',
  description: '방·집 면적과 주거 유형으로 적정 제습량(L/day)과 권장 제품 용량을 계산. 지하·장마철 보정 + 월 소비전력·전기요금 추정까지.',
  keywords: [
    '제습기 용량 계산', '제습기 평수', '제습기 몇리터', '제습기 전기요금',
    '20평 제습기 용량', '아파트 제습기 용량', '지하 제습기', '장마 제습기',
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
    q: '20평 아파트에는 몇 리터 제습기가 필요한가요?',
    a: '20평(약 66㎡) 아파트는 하루 제거 수분량이 <strong>약 15L</strong>로, <strong>16L급 제품</strong>이 적당합니다. 평당 약 0.76L(업계 통용 가이드)로 계산하며, 장마철에는 한 단계 위(20L급)가 여유롭습니다. 제품 정격 리터는 30℃·80%RH 고온다습 조건 시험값이라 실사용 제거량보다 크게 표시되니, 계산값과 같거나 조금 큰 등급을 고르면 됩니다.',
  },
  {
    q: '제습기 정격 리터와 실제 제거량이 다른 이유는?',
    a: '제품에 표기된 <strong>정격 제습량(L/day)</strong>은 <strong>30℃·상대습도 80%</strong>라는 고온다습 표준 조건에서 측정한 값입니다. 실제 집안은 이보다 온도·습도가 낮은 경우가 많아 하루 제거량이 정격보다 적게 나옵니다. 즉 16L 제품이 실사용에서 매일 16L를 뽑지는 않습니다 — 정격이 실사용 필요량보다 큰 것이 정상이며, 그만큼 여유 있게 습도를 잡아준다는 뜻입니다.',
  },
  {
    q: '지하·반지하는 왜 용량을 더 크게 잡나요?',
    a: '지하·반지하는 <strong>지중(땅속) 습기가 벽·바닥으로 스며들어</strong> 같은 면적의 아파트보다 습기 유입이 큽니다. 본 계산기는 지하·반지하를 평당 기준을 높여(관행 보정값) 잡습니다. 곰팡이·결로가 심하다면 계산값보다 한 단계 큰 제품 + 24시간 약하게 상시 가동 + 환기를 병행하는 것이 효과적입니다.',
  },
  {
    q: '제습기 전기요금은 얼마나 나오나요?',
    a: '제습기 소비전력은 용량별로 <strong>150~440W</strong> 수준입니다. 예를 들어 20L급(약 265W)을 하루 6시간, 한 달 가동하면 <strong>약 48kWh</strong>가 늘어납니다. 여기에 전기요금 단가를 곱하면 월 추가요금이 나오는데, 주택용 전기요금은 누진제라 이미 많이 쓰는 집일수록 kWh당 단가가 올라갑니다(하계 누진 3단계 기준 약 280원/kWh, 2026년 한전 요금표 기준). 계산기에서 하루 가동시간과 단가를 조절해 확인하세요.',
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
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        주거·인테리어
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="interior" />제습기 용량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        방·집 면적으로 <strong style={{ color: 'var(--text)' }}>적정 제습량(L/일)과 권장 제품 용량</strong> + 월 전기요금까지. 아파트·주택·지하·장마철 보정.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="한전 주택용(저압) 누진제 요금표 기준 — 소비전력은 국내 유통 제품 통상 범위"
        sources={[{ label: '한국전력 — 전기요금표(주택용)', href: 'https://cyber.kepco.co.kr/ckepco/front/jsp/CY/E/E/CYEEHP00101.jsp' }]}
      />

      <DehumidifierClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 공식 */}
        <section>
          <h2 style={sectionTitle}>제습기 용량 계산 공식</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px', color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>하루 제거 수분량(L)</span> = 면적(㎡) × 주거계수 × 습도보정</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>아파트 0.23 · 주택 0.31 · 지하 0.45 (L/㎡·일)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>습도보정: 평상시 1.0 · 장마 1.25 · 밀폐 1.15 · 빨래건조 1.4</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>예시:</strong> 20평 아파트(66㎡), 장마철<br />
            • 기본: 66 × 0.23 = <strong>15.2L</strong><br />
            • 보정: × 1.25(장마) = <strong style={{ color: 'var(--accent)' }}>19L / 일</strong><br />
            • 매칭: 20L급 제품(정격 20L/일 @30℃80%)
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 주거계수는 업계 통용 가이드(아파트 평당 0.76L·주택 1.02L)를 ㎡로 환산한 값이며, 습도보정은 실사용 관행값입니다. 정확한 필요량은 침수 이력·환기 조건에 따라 달라집니다.
          </p>
        </section>

        {/* 2. 평수별 권장 용량 표 */}
        <section>
          <h2 style={sectionTitle}>평수별 권장 제습기 용량 (아파트 기준)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['면적', '하루 제거량', '권장 용량', '용도'].map((h, i) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: i === 1 ? 'right' : 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['원룸 (5평·17㎡)', '약 4L', '10L급', '작은방·원룸'],
                  ['10평 (33㎡)', '약 8L', '10~16L급', '방·작은 거실'],
                  ['20평 (66㎡)', '약 15L', '16L급', '거실·전체'],
                  ['30평 (99㎡)', '약 23L', '20~30L급', '넓은 거실'],
                  ['40평↑ (132㎡)', '약 30L↑', '30L급 이상', '주택·상가'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            주택·빌라는 한 단계, 지하·반지하는 한~두 단계 큰 용량을 권장합니다. 장마철·실내 빨래건조를 자주 한다면 여유 용량이 유리합니다.
          </p>
        </section>

        {/* 3. 제습기 vs 에어컨 제습 */}
        <section>
          <h2 style={sectionTitle}>제습기 vs 에어컨 제습 모드 — 언제 무엇을</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>💧 제습기가 유리</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>장마철 눅눅함·곰팡이 제거</li>
                <li>실내 빨래 건조 (급속 건조)</li>
                <li>옷장·신발장·드레스룸 밀폐공간</li>
                <li>겨울 결로·지하 습기</li>
                <li>온도를 낮추지 않고 습기만</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cat-health)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--cat-health)', fontWeight: 700, marginBottom: 8 }}>❄️ 에어컨 제습이 유리</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>한여름 무더위 (냉방 겸용)</li>
                <li>넓은 거실 전체</li>
                <li>이미 에어컨이 있어 추가 구매 불필요</li>
                <li>시원함 + 습기 제거 동시</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            둘을 함께 쓰면 에어컨 설정온도를 1~2℃ 높여도 쾌적해 전기요금 절약에 도움이 됩니다.
          </p>
        </section>

        {/* 4. 전기요금·사용 팁 */}
        <section>
          <h2 style={sectionTitle}>제습기 전기요금 아끼는 사용법</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {[
              { t: '문·창 닫고 가동', items: ['밀폐 공간에서 제습 효율 최대', '가동 중 환기하면 습기 다시 유입', '방문 닫고 방 하나씩 집중'] },
              { t: '적정 습도 50~60%', items: ['너무 낮추면 전력 낭비·건조함', '습도 설정 기능으로 자동 유지', '빨래 건조는 40~50%'] },
              { t: '연속 배수 활용', items: ['물통 자주 비우기 번거로우면 호스 연결', '지하·장마철 상시 가동에 편리', '만수 정지로 밤새 멈추는 것 방지'] },
              { t: '필터·위치 관리', items: ['먼지 필터 2주마다 청소', '벽에서 20cm 이상 띄우기', '문틈·베란다 등 습기원 근처 배치'] },
            ].map((b, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{b.t}</p>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
                  {b.items.map((it, j) => <li key={j}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 5. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
            {RELATED.map((t, i) => (
              <Link key={i} href={t.href} style={{ display: 'block', padding: '14px 16px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, textDecoration: 'none' }}>
                <p style={{ fontSize: 20, marginBottom: 6 }}>{t.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{t.name}</p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
