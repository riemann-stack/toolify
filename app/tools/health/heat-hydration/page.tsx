import Link from 'next/link'
import HeatHydrationClient from './HeatHydrationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/health/heat-hydration',
  title: '폭염 수분·전해질 섭취 계산기 — 하루 물 얼마나',
  description: '체중·활동·폭염 특보 단계로 오늘 마셔야 할 물의 양과 활동 중 음용 패턴을 계산. 전해질 보충 시점·저나트륨혈증 주의·폭염 단계별 행동요령까지.',
  keywords: [
    '하루 물 섭취량 계산기', '수분 섭취량 계산', '폭염 물 얼마나', '폭염중대경보 기준',
    '폭염특보 단계', '전해질 보충', '발한량 계산', '온열질환 예방', '여름 러닝 수분',
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
    q: '하루에 물을 얼마나 마셔야 하나요?',
    a: '일반 성인은 <strong>체중 1kg당 약 30~33mL</strong>의 음료를 기준으로 삼습니다(체중 65kg이면 약 2.0~2.1L). 다만 이는 음식에 든 수분을 뺀 <strong>마시는 양</strong>이고, 총 수분 필요량에는 밥·국·과일 속 수분도 포함됩니다. 폭염·운동으로 땀을 많이 흘리면 잃은 만큼 더 보충해야 하며, 갈증·소변 색(진한 노란색이면 부족)으로도 확인할 수 있습니다.',
  },
  {
    q: '폭염중대경보가 뭔가요? (2026년 신설)',
    a: '기상청이 2026년 6월 폭염특보 체계를 개편하면서 기존 <strong>폭염주의보(체감 33℃)·폭염경보(체감 35℃)</strong> 위에 <strong>폭염중대경보(체감 38℃ 또는 기온 39℃)</strong>를 새로 만들었습니다. 중대경보는 최고 단계로, 하루만 예상돼도 발령될 수 있습니다. 이 단계에서는 외출·야외작업을 최대한 중단하고 냉방 공간에 머물러야 하며, 독거·고령자 안부 확인이 중요합니다.',
  },
  {
    q: '운동할 때 물은 얼마나, 어떻게 마시나요?',
    a: '땀 흘리는 운동 중에는 <strong>15~20분마다 한 컵(약 150~250mL)씩 나눠</strong> 마시는 것이 좋습니다. 한 번에 벌컥 많이 마시면 위에서 흡수되지 못하고 속만 불편해집니다. 격한 운동은 시간당 1~2L까지 땀이 나기도 하는데, 목표는 <strong>운동 후 체중이 시작보다 2% 이상 줄지 않게</strong> 하는 것입니다(ACSM 권고). 정확한 내 발한율은 위 계산기의 "발한율 직접 재보기"로 운동 전후 체중을 재서 확인할 수 있습니다.',
  },
  {
    q: '전해질(이온음료)은 꼭 마셔야 하나요?',
    a: '<strong>대부분은 물이면 충분합니다.</strong> 전해질(나트륨 등) 보충이 의미 있는 경우는 <strong>1시간 이상 땀을 많이 흘리는 운동·작업</strong>입니다. 이때 물만 많이 마시면 오히려 혈중 나트륨이 묽어질 수 있어 스포츠음료를 일부 섞는 것이 도움이 됩니다. 반대로 짧은 활동·일상에서 이온음료를 습관적으로 마시면 당분·나트륨을 과잉 섭취하게 됩니다. 한국인은 평소 나트륨 섭취가 많은 편이라 소금을 따로 챙겨 먹을 필요는 없습니다.',
  },
  {
    q: '물을 너무 많이 마시면 위험한가요?',
    a: '네. 짧은 시간에 지나치게 많은 물(대략 시간당 1L 이상)을 마시면 혈중 나트륨 농도가 떨어지는 <strong>저나트륨혈증(물 중독)</strong>이 생길 수 있습니다. 두통·구역·혼란·심하면 경련까지 올 수 있어, 특히 마라톤처럼 오래 운동하며 물만 계속 마실 때 주의해야 합니다. <strong>갈증에 맞춰 조금씩 자주</strong>가 원칙이며, 한 번에 몰아 마시지 마세요.',
  },
  {
    q: '신장이 안 좋은데 폭염엔 물을 더 마셔야 하나요?',
    a: '<strong>반대일 수 있어 반드시 주치의와 상의해야 합니다.</strong> 만성콩팥병·심부전·투석 중이거나 이뇨제를 복용하면 오히려 <strong>수분을 제한</strong>해야 하는 경우가 많습니다. 일반적인 "물 많이 드세요" 권고가 이런 분들께는 위험할 수 있으니, 폭염 시 적정 수분량은 담당 의료진이 정한 기준을 따르세요. 이 계산기도 해당 상태를 선택하면 계산 대신 상담을 안내합니다.',
  },
]

const RELATED = [
  { href: '/tools/sports/carb-loading', icon: '🍚', name: '카보로딩 계산기', desc: '마라톤 탄수화물 로딩' },
  { href: '/tools/health/bmr', icon: '🔥', name: '기초대사량 계산기', desc: '하루 소비 칼로리' },
  { href: '/tools/health/caffeine', icon: '☕', name: '카페인 잔존량 트래커', desc: '체내 카페인·이뇨 주의' },
  { href: '/tools/sports/pace', icon: '🏃', name: '러닝 페이스 계산기', desc: '목표 기록 페이스' },
  { href: '/tools/health/blood-alcohol', icon: '🍺', name: '혈중알코올 계산기', desc: '음주 후 BAC 추적' },
  { href: '/tools/interior/dehumidifier', icon: '💧', name: '제습기 용량 계산기', desc: '실내 습도 관리' },
]

export default function HeatHydrationPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        건강·웰빙
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="health" />폭염 수분·전해질 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        체중·활동·폭염 단계로 <strong style={{ color: 'var(--text)' }}>오늘 마셔야 할 물의 양</strong>과 활동 중 음용 패턴 + 전해질 보충 시점.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="기상청 폭염특보 3단계(2026 개편)·ACSM 수분 보충 지침 기준"
        sources={[
          { label: '질병관리청', href: 'https://www.kdca.go.kr' },
          { label: '기상청 날씨누리', href: 'https://www.weather.go.kr' },
        ]}
      />

      <HeatHydrationClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 계산 방식 */}
        <section>
          <h2 style={sectionTitle}>수분 권장량은 어떻게 계산하나요</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13px', color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>기본 수분(음료)</span> = 체중(kg) × 30~33 mL</div>
            <div><span style={{ color: 'var(--muted)' }}>활동 보충</span> = 활동 시간 × 발한율(L/h)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>발한율: 가벼운 활동 0.4~0.8 · 격한/폭염작업 1.0~1.8 L/h (ACSM)</div>
            <div style={{ paddingLeft: 20, fontSize: 12, color: 'var(--muted)' }}>폭염 경보 이상 → 발한 상단 가정 + 휴식·행동요령 강화</div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 기본 수분은 체중 비례 관행 기준이며 <strong style={{ color: 'var(--text)' }}>총 수분에는 음식 속 수분이 별도로 포함</strong>됩니다. 폭염 특보 단계는 물의 양을 일정 배수로 곱하는 공식이 아니라(공인 계수 없음), 활동 발한 가정과 행동요령·휴식 주기를 조정하는 축으로 반영했습니다.
          </p>
        </section>

        {/* 2. 폭염 특보 3단계 표 */}
        <section>
          <h2 style={sectionTitle}>폭염 특보 3단계 (기상청 2026 개편)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단계', '기준(체감온도)', '핵심 행동'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['폭염주의보', '33℃ 이상 2일↑', '한낮 활동 자제·규칙적 수분'],
                  ['폭염경보', '35℃ 이상 2일↑', '야외활동 중단·충분한 휴식'],
                  ['폭염중대경보', '38℃ 이상 (또는 기온 39℃)', '외출·작업 중단·냉방 공간·안부 확인'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            체감온도는 기온에 습도를 반영한 값으로, 습할수록 실제 기온보다 높게 느껴집니다. 함께 도입된 <strong style={{ color: 'var(--text)' }}>열대야 주의보</strong>는 밤 최저기온이 높게 유지될 때 발령됩니다.
          </p>
        </section>

        {/* 3. 온열질환 응급 대응 */}
        <section>
          <h2 style={sectionTitle}>온열질환 신호와 응급 대응</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--warning)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--warning)', fontWeight: 700, marginBottom: 8 }}>⚠️ 열탈진 (초기)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>많은 땀·창백·어지럼·메스꺼움</li>
                <li>두통·근육경련·심한 피로</li>
                <li>→ 시원한 곳, 옷 느슨히, 수분 보충</li>
                <li>→ 다리 올리고 안정, 회복 안 되면 병원</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--danger)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>🚨 열사병 (응급)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>땀이 안 남·피부 건조·40℃ 이상</li>
                <li>의식 혼미·경련·쓰러짐</li>
                <li>→ <strong>즉시 119</strong> 신고</li>
                <li>→ 그늘·냉방으로 옮겨 몸 식히기(의식 없으면 물 억지로 X)</li>
              </ul>
            </div>
          </div>
          <div style={{ background: 'color-mix(in srgb, var(--danger) 6%, var(--bg2))', border: '1px solid color-mix(in srgb, var(--danger) 25%, var(--border))', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--text)', marginTop: 12, lineHeight: 1.75 }}>
            🚨 의식이 없거나 경련·고열이면 <strong style={{ color: 'var(--danger)' }}>지체 없이 119</strong>. 물을 억지로 먹이면 기도로 넘어갈 수 있으니, 의식이 없으면 마시게 하지 말고 몸을 식히며 구조를 기다리세요.
          </div>
        </section>

        {/* 4. 수분 vs 전해질 */}
        <section>
          <h2 style={sectionTitle}>물 vs 이온음료 — 언제 무엇을</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>💧 물이면 충분</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>일상 생활·짧은 외출</li>
                <li>1시간 이내 가벼운 운동</li>
                <li>실내 냉방 환경</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--cat-health)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--cat-health)', fontWeight: 700, marginBottom: 8 }}>🧂 전해질 고려</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>1시간 이상 다량 발한 운동·작업</li>
                <li>마라톤·등산·한여름 야외노동</li>
                <li>물만 계속 마셔 속이 더부룩할 때</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 감염성 설사 치료용 경구수액(ORS)은 조성이 달라 폭염 일상 보충용으로 권장되지 않습니다. 당뇨·신장질환이 있으면 이온음료의 당분·나트륨·칼륨도 주의가 필요하니 의료진과 상의하세요.
          </p>
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
