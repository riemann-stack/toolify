import Link from 'next/link'
import SourdoughClient from './SourdoughClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/cooking/sourdough',
  title: '사워도우 스타터 계산기 — 르방 안정화 진단·피크 시간 예측',
  description: '사워도우 스타터(르방)가 안정화됐는지 3가지 조건으로 진단하고, 급이 비율·온도로 피크 시간을 예측합니다. 1:1:1~1:5:5 급이 비율표·온도별 발효 속도·아세톤 냄새 등 실패 해결 가이드 포함.',
  keywords: ['사워도우스타터계산기', '르방피크시간', '사워도우안정화', '르방계산기', '사워도우급이', '르방스타터', '천연발효빵계산기'],
})

const FAQ_LD = [
              { q: '사워도우 스타터가 안정화됐는지 어떻게 알 수 있나요?',
                a: '3가지 조건을 모두 충족하면 안정화로 봅니다. ① 급이 후 매번 비슷한 시간에 2배 이상 팽창, ② 피크 후 규칙적으로 꺼짐, ③ 이 패턴이 2~3회 이상 반복됨. 냄새는 시큼하지만 상쾌해야 하며, 아세톤이나 구린 냄새는 없어야 합니다.' },
              { q: '왜 초반(2~3일차)에 폭발적으로 부풀다가 조용해지나요?',
                a: '초반의 활발한 반응은 주로 류코노스톡(Leuconostoc) 같은 비효모성 세균들의 반응입니다. 이들이 산성 환경을 만들면 자연도태되고, 내산성이 강한 야생 효모와 젖산균이 자리잡으면서 일시적으로 조용해집니다. 이 "조용한 시기"가 오히려 안정화 진행 중이라는 신호입니다.' },
              { q: '냉장 보관 중인 스타터는 어떻게 관리하나요?',
                a: '냉장은 스타터를 죽이는 것이 아니라 급이 간격을 늘리는 방법입니다(콜로라도 주립대 익스텐션). 공식 권장은 주 1회 급이로, 일부만 남기고 스타터 : 물 : 밀가루 = 1:1:1로 먹인 뒤 거품이 올라오기 시작할 때까지 실온에 1~2시간 두었다가 냉장고로 되돌립니다. 실온에서 유지한다면 12시간마다 하루 2회 급이합니다.' },
              { q: '냉장 스타터 급이를 며칠 걸렀는데 살릴 수 있나요?',
                a: 'King Arthur 공식 안내에 따르면 며칠에서 몇 주를 걸러도 대부분 되살릴 수 있습니다. 먼저 1회 급이해 실온에 두고 12시간 동안 부피 변화를 관찰한 뒤, 12시간마다 급이를 반복해 6~8시간 안에 2~3배로 부풀면 구울 준비가 된 것입니다. 추가 급이가 여러 번, 며칠까지 걸릴 수 있으므로 날짜가 아니라 팽창 속도로 판단하세요. 다만 곰팡이나 분홍·주황 변색, 불쾌한 냄새 같은 오염 신호가 있으면 되살리지 말고 전량 폐기합니다.' },
              { q: '위에 고인 검은 액체(후치)는 상한 건가요? 곰팡이와 어떻게 구분하나요?',
                a: '후치는 야생 효모가 먹이를 먹으며 만들어낸 알코올과 물, 즉 발효 부산물이라 상한 것이 아니라 급이가 필요하다는 신호입니다. 따라 버려도 되고 다시 섞어 넣어도 되며 둘 다 공식적으로 허용됩니다. 색이 짙어지는 것은 산화 때문이라 색만으로는 판단하지 않습니다. 반면 색깔 있거나 솜털 같은 곰팡이, 분홍색·주황색 기미나 줄무늬, 불쾌한 냄새는 상했다는 신호입니다. 이때는 일부만 덜어내 살리지 말고 전량 버린 뒤 용기를 씻고 헹궈 처음부터 다시 시작하세요.' },
              { q: '통밀이나 호밀을 섞으면 왜 더 빨리 활성화되나요?',
                a: '통곡물에는 흰 밀가루보다 사워도우에 유익한 미생물이 훨씬 많이 들어 있습니다. 특히 호밀은 효모와 박테리아가 이용하기 쉬운 유리당이 많고 전분 분해 효소 함량이 높아 발효가 빨라집니다(King Arthur 공식 문서). 반응이 굼뜰 때 흰 밀가루 대비 10~20%를 섞어 1~2회 급이하는 단발 처방으로 쓰며, 그 정도 소량은 스타터의 풍미를 바꾸지 않습니다. 새 스타터를 처음 만들 때도 통밀·호밀이 권장됩니다.' },
              { q: '사워도우를 베이킹에 사용할 때 가장 좋은 타이밍은?',
                a: '피크 직전~피크 직후 1시간 이내가 최적입니다. 스타터를 물에 넣었을 때 뜨는지 확인하는 플로트 테스트와 함께, 표면에 많은 기포가 보이고 전체가 둥글게 부풀어 있을 때 사용하세요. 피크를 완전히 지나 꺼지기 시작하면 활성이 떨어져 빵이 잘 부풀지 않을 수 있습니다.' },
            ]

export default function SourdoughPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="cooking" />사워도우 스타터 &amp; 르방 피크 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        스타터 안정화 진단 + 피크 시간 예측 + <strong style={{ color: 'var(--text)' }}>급이 일정 자동 스케줄러</strong>.
      </p>

      <SourdoughClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 사워도우 스타터란? ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            사워도우 스타터(르방)란?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            사워도우 스타터는 <strong style={{ color: 'var(--text)' }}>야생 효모(Wild Yeast)와 젖산균(LAB)의 공생 배양체</strong>입니다. 밀가루와 물만으로 공기 중의 미생물을 포집해 만드는 천연 발효종으로, 프랑스어로는 <strong style={{ color: 'var(--text)' }}>르방(Levain)</strong>이라 부릅니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { title: '🍞 깊은 풍미',  desc: '젖산·초산이 만드는 복합적인 산미와 감칠맛. 상업 이스트 빵에서는 얻을 수 없는 향미.' },
              { title: '🌾 소화 흡수',  desc: '긴 발효 중 글루텐이 일부 분해되고 피트산이 중화되어, 일반 빵보다 소화가 잘 됩니다.' },
              { title: '🕰️ 긴 보존성',  desc: '산성 환경 덕분에 곰팡이 억제 효과가 있어 상업 빵보다 오래 보관할 수 있습니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>{c.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. 7~14일 로드맵 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            사워도우 스타터 7~14일 로드맵
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['일차', '예상 상태', '냄새', '권장 행동'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { d: '1~2일',    s: '반응 없거나 약한 기포',     n: '밀가루 냄새',       a: '그냥 기다리기' },
                  { d: '2~3일',    s: '활발한 기포, 2배 이상 팽창', n: '시큼하고 역함',     a: '정상! 계속 급이' },
                  { d: '3~5일',    s: '팽창 줄어듦',               n: '아세톤/치즈 냄새',  a: '급이 비율 늘리기' },
                  { d: '5~8일',    s: '들쑥날쑥',                  n: '시큼함 안정',       a: '같은 시간 급이 유지' },
                  { d: '8~12일',   s: '패턴 형성',                 n: '상큼한 시큼함',     a: '피크 타이밍 기록' },
                  { d: '12~14일',  s: '예측 가능한 피크',          n: '요거트+빵 냄새',    a: '베이킹 테스트!' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.d}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 급이 비율 시각화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            급이 비율 이해하기
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '18px 22px', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--accent)', textAlign: 'center', margin: '0 0 8px' }}>
              1 : 1 : 1
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)', textAlign: 'center', margin: 0 }}>
              스타터 : 물 : 밀가루 &nbsp;·&nbsp; 예) 20g : 20g : 20g
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['비율', '특징', '피크 속도', '적합 온도'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { r: '1:1:1', f: '음식 적음 → 빠름',   p: '3~4시간',   t: '서늘한 곳' },
                  { r: '1:2:2', f: '균형 잡힌 표준',     p: '4~6시간',   t: '20~24°C' },
                  { r: '1:3:3', f: '여유로운 급이',       p: '5~8시간',   t: '따뜻한 곳' },
                  { r: '1:5:5', f: '음식 많음 → 느림',    p: '7~10시간',  t: '25°C 이상' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row.r}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{row.f}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 500 }}>{row.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ※ 피크 속도는 <strong style={{ color: 'var(--text)' }}>24°C·백밀·피크 직후 급이</strong> 기준 (위 계산기와 동일). 온도가 10°C 낮아지면 약 2배 느려지고, 통밀·호밀을 섞으면 빨라집니다. &lsquo;적합 온도&rsquo;는 각 비율에 권장하는 보관 환경입니다.
          </p>
        </div>

        {/* ── 4. 온도별 발효 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            온도별 발효 속도 가이드
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { t: '15~18°C', c: '#0891B2', title: '느린 발효', desc: '피크 12~18시간. 복잡한 산미 발달에 유리합니다. 겨울철 실내 일반.' },
              { t: '20~22°C', c: '#059669', title: '표준 속도', desc: '균형 잡힌 발효. 대부분의 레시피가 가정하는 기준 온도입니다.' },
              { t: '23~25°C', c: '#0EA5E9', title: '빠른 발효', desc: '여름 실내 일반. 급이 주기를 12시간 이하로 짧게 가져가세요.' },
              { t: '26~28°C', c: '#EA580C', title: '매우 빠름', desc: '급이 비율을 1:3:3 이상으로 늘려야 과발효를 막을 수 있습니다.' },
              { t: '28°C+',   c: '#DC2626', title: '주의 구간', desc: '아세톤 생성 위험. 냉장 보관이나 에어컨 공간 활용을 고려하세요.' },
            ].map((z, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${z.c}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '15px', fontWeight: 800, color: z.c, marginBottom: '4px' }}>{z.t}</p>
                <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '6px' }}>{z.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{z.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 냉장 보관과 부활(revive) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            냉장 보관과 부활(revive) 절차
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            매일 굽지 않는다면 냉장이 현실적입니다. 콜로라도 주립대 익스텐션은 냉장을 <strong style={{ color: 'var(--text)' }}>급이 간격을 늘리는 수단</strong>으로 설명합니다 — 규칙적으로 급이한다면 반드시 필요한 것은 아니라는 뜻입니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 560 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['상황', '절차', '판단 기준'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '평소 유지(냉장)', a: '일부만 남기고 스타터 : 물 : 밀가루 = 1:1:1로 급이 (공식 예시는 남기는 양 50g 또는 113g 두 가지 스케일)', j: '약 주 1회' },
                  { s: '급이 직후', a: '바로 넣지 말고 거품이 올라오기 시작할 때까지 실온에 두었다가 냉장으로 복귀', j: '실온 1~2시간' },
                  { s: '실온 유지', a: '냉장하지 않는다면 하루 2회 급이', j: '12시간마다' },
                  { s: '굽기 전 부활', a: '굽기 하루~이틀 전에 냉장고에서 꺼내 실온에서 두어 번 급이', j: '급이 간격 12시간' },
                  { s: '준비 완료 판정', a: '급이 후 부푸는 속도로 판단 — 날짜가 아니라 상태가 기준', j: '6~8시간 내 2~3배' },
                  { s: '오래 걸렀을 때', a: '먼저 1회 급이해 실온에서 12시간 관찰, 2배로 부풀 때까지 급이 반복', j: '여러 번·며칠 소요 가능' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.s}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{r.j}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ※ 급이를 며칠에서 몇 주 걸러도 대부분 되살릴 수 있다는 것이 King Arthur의 공식 입장입니다. 단, &lsquo;며칠이면 된다&rsquo;는 날짜가 아니라 <strong style={{ color: 'var(--text)' }}>6~8시간 안에 2~3배 팽창</strong>이라는 상태가 판정 기준입니다. (2026-07 확인 · King Arthur Baking 공식 가이드, Colorado State University Extension, South Dakota State University Extension)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '14px' }}>
            {[
              { title: '🌾 굼뜬 스타터 부스트', desc: '반응이 느릴 때 흰 밀가루 대비 통밀·호밀 10~20%를 섞어 1~2회만 급이하는 처방입니다. 통곡물에는 사워도우에 유익한 미생물이 더 많고, 호밀은 효모·박테리아가 이용하기 쉬운 유리당이 많고 전분 분해 효소 함량이 높아 발효가 빨라집니다. 이 정도 소량은 풍미를 바꾸지 않으며 정밀 계량도 필요 없습니다. 상시 급이용 처방은 아니고, 평상시 유지에는 무표백 중력분도 충분합니다.' },
              { title: '♻️ 폐기 스타터(discard)', desc: '급이 때 덜어내는 부분입니다. 아까워서 버리는 것이 아니라 미생물을 건강하게 유지하고 양이 불어나는 것을 막는 과정입니다. King Arthur는 와플·팬케이크·피자 도우·크래커·바나나 브레드·쿠키 등 디스카드 전용 레시피를 공식 운영하고, 굽지 않을 때는 퇴비화하거나 유산지에 얇게 펴 말려 버리는 방법도 안내합니다. 보관은 뚜껑 있는 용기에 냉장이며, 공식 표현은 "여러 주(several weeks)"로 정확한 일수를 못박지 않습니다.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>{c.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 후치(hooch)와 위험 신호 구분 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            후치(hooch)와 위험 신호 구분
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            스타터 위에 고이는 액체를 후치라고 부릅니다. King Arthur는 이를 <strong style={{ color: 'var(--text)' }}>야생 효모가 먹이를 먹으며 만들어낸 알코올과 물</strong>, 즉 발효 부산물로 정의합니다. 상했다는 신호가 아니라 급이가 필요하다는 신호이며, 액체 색이 짙어지는 것은 입자가 산화되기 때문이라 색만으로 판단할 수 없습니다. 처리는 <strong style={{ color: 'var(--text)' }}>따라 버리기·다시 섞어 넣기 둘 다 공식 허용</strong>입니다(King Arthur·콜로라도 주립대 익스텐션 동일). 알코올이 풍미를 더할 수 있어 섞는 쪽을 택하기도 하고, 액체가 0.5인치(약 1.3cm) 이상으로 많고 아주 어두울 때는 수분율이 달라지므로 따라내라는 안내가 함께 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { c: 'var(--success)', title: '✅ 급이하면 되는 상태', desc: '표면에 고인 액체(후치), 알코올 섞인 시큼한 냄새, 줄어든 팽창 폭 — 평소대로 급이하면 회복됩니다.' },
              { c: 'var(--danger)',  title: '🚫 폐기해야 하는 신호', desc: '분홍색·주황색 기미나 줄무늬, 색깔 있거나 솜털 같은 곰팡이, 불쾌한 냄새, 초록·분홍·주황 반점. 일부만 덜어내 살리지 말고 전량 버린 뒤 용기를 깨끗이 씻고 헹궈 처음부터 다시 시작합니다.' },
            ].map((z, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderLeft: `3px solid ${z.c}`, borderRadius: '10px', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', color: z.c, fontWeight: 700, marginBottom: '6px' }}>{z.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{z.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            ※ 분홍·주황 줄무늬는 스타터 표면뿐 아니라 용기 벽에 말라붙은 부분에도 나타나므로 함께 살펴보세요. 이 절의 기준은 King Arthur Baking 공식 문서와 콜로라도·사우스다코타 주립대 익스텐션 자료입니다(2026-07 확인). 국내 공공기관이 배포한 가정용 사워도우 스타터 관리 지침은 확인되지 않았습니다.
          </p>
        </div>

        {/* ── 7. 자주 하는 실수 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 하는 실수 &amp; 해결법
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { p: '🧪 아세톤/매니큐어 냄새', c: '#DC2626', s: '과산성화 상태. 스타터 일부만 남기고 1:5:5 비율로 리셋. 2~3회 급이 후 정상화됩니다.' },
              { p: '💥 초반 폭발 후 조용해짐', c: '#0EA5E9', s: '유해균→효모로 교체되는 정상 과정. 2~3일 더 급이를 유지하면 다시 반응이 올라옵니다.' },
              { p: '⏱️ 피크가 너무 빠름 (2시간 이내)', c: '#EA580C', s: '온도가 과도하게 높습니다. 더 시원한 곳으로 옮기거나 급이 비율을 1:3:3 이상으로 늘리세요.' },
              { p: '⏳ 24시간 동안 피크 없음', c: '#0891B2', s: '너무 차갑습니다. 22~25°C 공간으로 옮기거나 호밀가루 10~20%를 섞어 활성화 속도를 높이세요.' },
              { p: '💧 물처럼 묽어짐', c: '#EA580C', s: '과발효로 글루텐이 분해된 상태. 급이 횟수를 1일 2회로 늘리고, 밀가루 비율을 스타터의 2배로.' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${m.c}55`, borderLeft: `3px solid ${m.c}`, borderRadius: '10px', padding: '14px 18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: m.c, marginBottom: '6px' }}>{m.p}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>{m.s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 8. 플로트 테스트 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            플로트 테스트(Float Test) 해석 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            스타터 한 찻숟가락을 물에 넣어 떠오르는지 확인하는 간단한 성숙도 테스트입니다. 충분히 가스가 차 있으면 떠오릅니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {[
              { icon: '✅', title: '뜨면', color: '#059669', desc: '충분한 가스 생성 = 베이킹 준비 완료. 피크 직후 타이밍일 가능성이 높습니다.' },
              { icon: '❌', title: '가라앉으면', color: '#DC2626', desc: '아직 미성숙이거나 이미 피크를 지난 상태. 1~2시간 더 기다리거나 다음 급이 후 재테스트.' },
              { icon: '⚠️', title: '주의', color: '#EA580C', desc: '묽은 스타터·호밀 비율이 높은 경우 부정확할 수 있습니다. 부피 2배 팽창 확인을 병행하세요.' },
            ].map((f, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${f.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '18px', marginBottom: '6px' }}>{f.icon}</p>
                <p style={{ fontSize: '13px', color: f.color, fontWeight: 700, marginBottom: '6px' }}>{f.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 9. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQ_LD.map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0', overflow: 'hidden' }}>
                <summary style={{ cursor: 'pointer', padding: '16px 20px', fontSize: '14px', fontWeight: 500, color: 'var(--text)', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <span>Q. {faq.q}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', flexShrink: 0 }}>▼</span>
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, padding: '0 20px 16px', margin: 0, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>A. {faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* ── 10. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',    desc: '르방 양에 맞춰 재료 비율 자동 계산' },
              { href: '/tools/date/dday',       icon: '📅', name: 'D-day 계산기',          desc: '베이킹 날까지 카운트다운' },
              { href: '/tools/life/pomodoro',   icon: '🍅', name: '뽀모도로 타이머',       desc: '반죽 휴지 시간 관리' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
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
    </div>
  )
}
