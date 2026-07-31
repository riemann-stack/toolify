import Link from 'next/link'
import HeatHydrationClient from './HeatHydrationClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'
import Disclaimer from '@/components/Disclaimer'

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
        basis="기상청 폭염특보 3단계(2026 개편)·산업안전보건규칙 폭염 조항(2025-07-17 시행)·ACSM/NATA 수분 보충 지침 기준"
        sources={[
          { label: '질병관리청', href: 'https://www.kdca.go.kr' },
          { label: '기상청 날씨누리', href: 'https://www.weather.go.kr' },
          { label: '국가법령정보센터', href: 'https://www.law.go.kr' },
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

        {/* 1-1. 발한율 직접 측정 절차 */}
        <section>
          <h2 style={sectionTitle}>내 발한율 직접 재보기 — 운동 전후 체중 측정</h2>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, marginBottom: 12 }}>
            발한율은 개인차가 커서 표준 범위(위 계산기의 0.4~1.8 L/h)만으로는 부족할 수 있습니다. 대회나 한여름 장거리 훈련을 준비한다면 스포츠의학 표준 절차(NATA 2017 공식·코네티컷대 Korey Stringer Institute 측정법)로 <strong>내 값을 직접 재는 것</strong>이 정확합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단계', '절차', '포인트'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['① 사전 확인', '소변 색이 옅은지 확인하고 시작', '탈수 상태에서 재면 값이 왜곡됨'],
                  ['② 운동 전 체중', '가능한 한 맨몸으로 측정', '땀에 젖은 옷 무게가 가장 큰 오차 요인'],
                  ['③ 1시간 운동', '평소 강도·비슷한 더위에서 운동', '물을 안 마시면 계산이 가장 단순 — 마셨다면 양 기록'],
                  ['④ 운동 후 체중', '땀을 닦고 같은 체중계·같은 조건으로 재측정', '중간에 본 소변량도 기록'],
                  ['⑤ 계산', '발한량(L) = 전 체중 − 후 체중(kg) + 마신 물(L) − 소변량(L)', '체중 1kg 감소 ≈ 수분 1L 손실 · ÷운동 시간 = L/h'],
                  ['⑥ 적용', '위 계산기 "💦 내 발한율 직접 재보기"에 입력', '다음 활동의 시간당 음용 목표로 사용'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 위 계산기는 소변량 0을 가정하므로, 중간에 화장실을 다녀왔다면 그 양만큼 &quot;마신 물&quot;에서 빼고 입력하세요. 목표는 <strong style={{ color: 'var(--text)' }}>운동 후 체중 감소 2% 이내</strong>(ACSM·NATA 공통)이고, 다음 활동까지 4시간이 안 남았다면 잃은 양의 <strong style={{ color: 'var(--text)' }}>100~150%</strong>를 나눠 보충합니다(NATA 2017). 발한율이 위(胃) 흡수 한계(시간당 약 1.2L)를 넘으면 운동 중 전량 보충은 불가능하니 나머지는 운동 후에 채우세요.
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

        {/* 2-1. 폭염의 법정 기준 (일터) */}
        <section>
          <h2 style={sectionTitle}>폭염의 공식 기준 — 법·지침 (일하는 사람)</h2>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.8, marginBottom: 12 }}>
            2024년 10월 개정된 <strong>산업안전보건법 제39조제1항제7호</strong>(2025-06-01 시행)가 폭염에 장시간 작업할 때 생기는 건강장해를 사업주의 보건조치 의무로 명문화했고, 구체적인 조치는 <strong>2025-07-17 공포·시행</strong>된 산업안전보건기준에 관한 규칙 개정이 정했습니다. 규칙상 &quot;폭염작업&quot;은 <strong>체감온도 31℃ 이상</strong>인 작업장소에서의 장시간 작업이며, 체감온도는 바닥에서 1.2~1.5m 높이에서 측정합니다(배달 등 이동작업은 기상청 발표 체감온도로 대체 가능).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['체감온도', '성격', '사업주 조치'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['31℃ 이상', '법정 의무', '냉방·통풍 장치, 작업시간대 조정, 휴식 중 1개 이상 — 앞의 두 조치로도 31℃ 이상이면 휴식까지'],
                  ['33℃ 이상', '법정 의무', '매 2시간 이내 20분 이상 휴식 — 작업 성질상 휴식이 매우 곤란한 경우에 한해 개인용 냉방·통풍장치나 보냉장구 지급 등으로 대체 가능'],
                  ['35·38℃ 이상', '지침 권고', '매시간 15분 휴식, 무더위 시간대(14~17시) 옥외작업 중지 등 — 법적 의무는 아님'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            이와 별도로 옥외 작업의 그늘진 휴식 장소 제공(2017년부터 의무), <strong style={{ color: 'var(--text)' }}>소금과 깨끗한 음료수 비치</strong>, 온·습도계 비치와 체감온도 일자별 기록, 열사병 등 의심 시 <strong style={{ color: 'var(--text)' }}>지체 없이 119 신고</strong>가 규칙에 명시돼 있습니다. 보건조치 위반은 과태료가 아니라 <strong style={{ color: 'var(--text)' }}>형벌</strong>(5년 이하 징역 또는 5천만원 이하 벌금, 근로자 사망 시 7년 이하 징역 또는 1억원 이하 벌금) 대상입니다. — 근거: 산업안전보건기준에 관한 규칙 제558~571조·고용노동부 「폭염 대비 온열질환 예방 사업장 대응지침」(2026. 5.), 2026-07 현행 기준.
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
                <li>→ 경련 근육은 마사지 — 경련이 지속되거나 심장질환자는 바로 응급실</li>
                <li>→ 다리 올리고 안정, 회복 안 되면 병원</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid var(--danger)', borderRadius: 12, padding: '14px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 700, marginBottom: 8 }}>🚨 열사병 (응급)</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.85 }}>
                <li>땀이 안 남·피부 건조·40℃ 이상</li>
                <li>의식 혼미·경련·쓰러짐</li>
                <li>→ <strong>즉시 119</strong> 신고, 시원한 곳으로 옮기기</li>
                <li>→ 옷 느슨히, 몸에 시원한 물 적셔 부채·선풍기로 식히기</li>
                <li>→ 얼음주머니는 목·겨드랑이·서혜부에 (의식 없으면 음료 절대 금지)</li>
              </ul>
            </div>
          </div>
          <div style={{ background: 'color-mix(in srgb, var(--danger) 6%, var(--bg2))', border: '1px solid color-mix(in srgb, var(--danger) 25%, var(--border))', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--text)', marginTop: 12, lineHeight: 1.75 }}>
            🚨 의식이 없거나 경련·고열이면 <strong style={{ color: 'var(--danger)' }}>지체 없이 119</strong>. 물을 억지로 먹이면 기도로 넘어갈 수 있으니, 의식이 없으면 마시게 하지 말고 몸을 식히며 구조를 기다리세요.
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 응급조치 기준: 질병관리청 「대상자별 온열질환 예방 매뉴얼」(2025년 7월, 대한응급의학회·대한스포츠의학회 등 감수). 수분 보충이 권장되는 것은 열탈진·열경련처럼 의식이 명료한 경우이며, 열사병은 대응이 다릅니다.
          </p>
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
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.7 }}>
            ☕ <strong style={{ color: 'var(--text)' }}>카페인·알코올은?</strong> 질병관리청 국가건강정보포털은 폭염 시 &quot;카페인이나 알코올을 함유한 음료수는 탈수를 증가시키기 때문에 적합하지 않다&quot;고 안내하고, 온열질환 예방 매뉴얼도 심·뇌혈관질환자의 운동 전후 술·카페인 음료와 농작업 중 막걸리·맥주를 피하라고 명시합니다. 스포츠의학 지침(NATA 2017)은 운동 중 적당량(체중 1kg당 약 3mg) 카페인이 이뇨를 유발하지는 않는다고 평가하지만, 폭염 야외활동의 기본 음료는 물·이온음료입니다.
          </p>
        </section>

        {/* 5. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5-1. 면책 */}
        <section>
          <Disclaimer variant="medical">
            수분 권장량은 평균 통계 기반 <strong>참고용 추정치</strong>이며, 신장 질환·심부전 등으로 수분 제한이 필요하거나 이뇨제를 복용 중이라면 별도 기준이 적용되므로 주치의 지시를 따르세요.
            어지러움·의식 저하·경련 등 온열질환 응급 증상이 보이면 즉시 <strong>119</strong>에 신고하세요.
          </Disclaimer>
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
