import Link from 'next/link'
import FoodStorageClient from './FoodStorageClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/cooking/food-storage',
  title: '식재료 보관 계산기 — 냉장·냉동 소비 기한 D-day',
  description: '냉장·냉동 식재료가 언제까지 안전한지 + 소비 기한 알림으로 음식물 쓰레기 줄이기. 식품별 정확한 보관 기간.',
  keywords: ['식재료보관기간계산기', '닭고기냉장며칠', '익힌고기냉장며칠', '국냉장며칠', '밥냉동며칠', '다진고기냉장', '냉동보관기간', '소비기한계산기', '식재료유통기한'],
})

const FAQ_LD = [
              { q: '익힌 고기는 냉장고에서 며칠까지 먹을 수 있나요?',
                a: '식약처 권고 기준 조리 후 3~4일 이내가 안전합니다. 단 조리 직후 빠르게 식혀 밀폐 보관했을 때 기준이며, 실온에 2시간 이상 두었거나 여러 번 데워 먹었다면 더 짧아집니다. 4일 안에 못 먹을 것 같다면 1회분씩 소분해 냉동(2~3개월)으로 옮기세요. 식품별 공식 기준은 식약처가 식품안전나라(foodsafetykorea.go.kr)에 공개한 「식품유형별 소비기한 설정 보고서」 등 소비기한 자료에서 확인할 수 있습니다.' },
              { q: '한 번 해동한 고기를 다시 냉동해도 되나요?',
                a: '원칙적으로 재냉동은 권장되지 않습니다. 해동 과정에서 세포가 손상돼 박테리아가 증식하기 좋은 환경이 되고, 다시 얼리면 풍미·식감이 크게 떨어집니다. 다만 \'냉장에서 천천히 해동한 생고기\'를 즉시(2일 이내) 조리한 후라면 익힌 상태로 다시 냉동할 수 있습니다.' },
              { q: '밥은 냉장과 냉동 중 어디에 보관하는 게 좋나요?',
                a: '하루 내에 먹을 거라면 냉장(1~2일), 그 이상이라면 무조건 냉동(2~4주)이 좋습니다. 밥은 0~4°C 냉장 온도에서 전분이 노화돼 굳고 맛이 빠르게 떨어집니다. 갓 지은 밥을 식기 전에 1회분씩 랩이나 밀폐용기에 소분해 바로 냉동하면 막 지은 밥처럼 회복됩니다.' },
              { q: '국·찌개는 냉장고에서 며칠까지 안전한가요?',
                a: '2~3일 이내가 권장 기준입니다. 매번 먹을 때 한 번 더 팔팔 끓이면 표면 박테리아가 사라지지만, 끓이고 식히기를 4~5회 반복하면 풍미가 사라지고 식중독 위험도 누적됩니다. 김치찌개·된장찌개 등 발효 베이스는 4일까지도 가능하지만, 맑은 국·미역국은 2일 안에 먹는 것이 안전합니다.' },
              { q: '우유 유통기한이 지났는데 냄새가 멀쩡하면 먹어도 되나요?',
                a: '미개봉 상태에서 유통기한 1~2일 지난 정도이고 냄새·맛이 멀쩡하다면 대개 안전합니다. 한국의 \'유통기한\'은 판매 가능 기한이고, 실제 \'소비기한\'은 보통 그보다 4~5일 더 깁니다. 단 개봉한 우유는 유통기한과 무관하게 개봉 후 3~5일 이내에 모두 마시세요. 응어리·분리·시큼한 냄새 중 하나라도 있으면 즉시 폐기.' },
              { q: '소비기한과 유통기한은 어떻게 다른가요?',
                a: '유통기한은 제조일로부터 소비자에게 판매가 허용되는 기한(영업자 중심)이고, 소비기한은 표시된 보관방법을 준수했을 때 섭취해도 안전에 이상이 없다고 판단되는 기한(소비자 중심)입니다. 식약처 기준으로 유통기한은 품질안전한계기간의 60~70%, 소비기한은 80~90% 시점으로 설정됩니다. 2023년 1월 1일부터 소비기한 표시제가 시행돼 식품 포장에는 유통기한 대신 소비기한이 표시됩니다(냉장 우유류는 2031년 1월 1일부터 적용). 소비기한이 지난 식품은 섭취하지 말고 폐기하세요. (출처: 식약처·대한민국 정책브리핑)' },
              { q: '김치는 냉장고에서 얼마나 보관할 수 있나요?',
                a: '식약처가 공개한 소비기한 참고값(2022년 12월 기준) 기준, 포장 김치의 소비기한 참고값은 35일로 기존 유통기한 30일보다 5일 깁니다. 단 이는 표시된 보관방법(냉장)을 준수한 제품 기준입니다. 집에서 담근 김치는 별도의 공인 기준이 없으며, 발효식품 특성상 시간이 지나면 상하기보다 신맛이 강해지는 쪽으로 변하는 것으로 알려져 있습니다. 군내·점성·푸른색이나 검은색 곰팡이 등 평소와 다른 이상이 보이면 폐기하세요.' },
              { q: '달걀은 어떻게 보관하는 게 좋나요?',
                a: '식약처는 달걀을 전용 용기에 담아 뾰족한 부분이 아래로 향하게 냉장 보관할 것을 권고합니다. 둥근 쪽에 있는 공기주머니(기실)가 위로 가야 세균 노출 위험이 줄어드는 것으로 알려져 있습니다. 금이 간 달걀은 세균 오염 위험이 있어 먹지 않는 것이 안전하며, 실온에 장시간 둔 달걀도 피하세요. 달걀 요리는 조리 후 60°C 이상 또는 5°C 이하에서 보관하는 것이 식약처 권고입니다. (출처: 식약처 카드뉴스, 2019)' },
              { q: '두부 유통기한이 하루 지났는데 먹어도 되나요?',
                a: '미개봉·냉장 보관 기준이라면 대개 안전합니다. 식약처 소비기한 참고값(2022년 12월 기준)에 따르면 두부의 소비기한 참고값은 23일로, 기존 유통기한 17일보다 6일 깁니다. 단 이는 표시된 보관방법을 준수한 미개봉 제품 기준이며, 개봉한 두부는 이와 무관하게 3~4일 이내에 먹는 것이 좋습니다. 쉰내·점성·포장 부풀음 중 하나라도 있으면 즉시 폐기하세요.' },
            ]

const faqDetails: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '12px',
  padding: '14px 18px',
  marginBottom: '8px',
}
const faqSummary: React.CSSProperties = {
  cursor: 'pointer',
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--text)',
  padding: '4px 0',
}
const faqAnswer: React.CSSProperties = {
  marginTop: '10px',
  paddingTop: '10px',
  borderTop: '1px solid var(--border)',
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
}

export default function FoodStoragePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧊 식재료 보관 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '12px' }}>
        냉장·냉동 식재료가 <strong style={{ color: 'var(--text)' }}>언제까지 안전한지</strong> + 소비 기한 알림으로 음식물 쓰레기 줄이기.
      </p>
      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        이 도구는 <strong style={{ color: 'var(--text)' }}>언제까지 보관할 수 있는지(소비 기한 D-day)</strong>를 다룹니다. 냉동한 식재료를 얼마 만에 녹일 수 있는지는 <Link href="/tools/cooking/thawing" style={{ color: 'var(--accent)' }}>해동 시간 계산기</Link>에서 확인하세요.
      </p>

      {/* ── 면책 조항 (상단) ── */}
      <div style={{
        background: 'rgba(234,88,12,0.06)',
        border: '1px solid rgba(234,88,12,0.25)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '40px',
      }}>
        <p style={{ fontSize: '13px', color: '#EA580C', fontWeight: 700, marginBottom: '6px' }}>⚠️ 안내</p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
          본 계산기는 식약처 권고 일반 기준에 따른 <strong style={{ color: 'var(--text)' }}>참고용 정보</strong>입니다. 실제 보관 가능 기간은 냉장고 온도·포장 상태·취급 환경에 따라 크게 달라질 수 있습니다. 색·냄새·점성에 이상이 있다면 D-day와 무관하게 폐기하세요.
          {' '}기준 자료: 식약처 「식품유형별 소비기한 설정 보고서」 — <a href="https://www.foodsafetykorea.go.kr/portal/board/board.do?menu_grp=MENU_NEW01&menu_no=4612" target="_blank" rel="noopener noreferrer" style={{ color: '#EA580C', textDecoration: 'underline', textUnderlineOffset: '2px' }}>식품안전나라 소비기한 자료실 ↗</a>
        </p>
      </div>

      <FoodStorageClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            자주 검색되는 식재료 보관 기간 빠른 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
            냉장고 0~4°C, 냉동 −18°C 이하 기준 · 밀폐 보관 시
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식재료', '상태', '냉장', '냉동', '핵심 메모'].map((h, i) => (
                    <th key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '닭고기 (생)',     s: '미개봉', f: '1~2일',  z: '6~9개월',  m: '가장 빨리 상함, 즉시 냉동 권장' },
                  { n: '다진 고기',       s: '생',     f: '1~2일',  z: '3~4개월',  m: '표면적 넓어 박테리아 빠른 증식' },
                  { n: '익힌 고기',       s: '조리 후', f: '3~4일',  z: '2~3개월',  m: '바로 식혀 밀폐, 1회분 소분' },
                  { n: '생선 (생)',       s: '미개봉', f: '1~2일',  z: '3~4개월',  m: '비린내 시작되면 폐기' },
                  { n: '국·찌개',         s: '조리 후', f: '2~3일',  z: '1~2개월',  m: '한 번 더 끓여 식힌 후 보관' },
                  { n: '밥',              s: '조리 후', f: '1~2일',  z: '2~4주',    m: '굳기 전 1회분 소분 냉동' },
                  { n: '계란',            s: '미개봉', f: '3~5주',  z: '권장 X',   m: '뾰족한 쪽 아래로 보관' },
                  { n: '우유 (개봉)',     s: '개봉',   f: '3~5일',  z: '권장 X',   m: '유통기한과 관계없이 개봉 후 5일' },
                  { n: '두부 (개봉)',     s: '개봉',   f: '3~4일',  z: '권장 X',   m: '물에 담가 매일 갈아주기, 냉동 시 식감 변화' },
                  { n: '햄·소시지 (개봉)', s: '개봉',   f: '5~7일',  z: '1~2개월',  m: '진공포장 미개봉은 냉장 2~3주' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.s}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.f}</td>
                    <td style={{ padding: '9px 10px', color: '#B885DA', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.z}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 보관 방식별 핵심 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            보관 방식별 핵심 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                icon: '🌡️', name: '실온 보관',  c: '#CA8A04',
                temp: '15~25°C, 직사광선 X',
                tips: [
                  '바나나·토마토·양파·마늘·감자 등은 실온이 더 적합',
                  '여름철(28°C 이상)에는 실온 식품도 냉장 권장',
                  '쌀·밀가루는 밀폐용기 + 냉암소(서늘하고 어두운 곳)',
                ],
              },
              {
                icon: '❄️', name: '냉장 보관',  c: '#0891B2',
                temp: '0~4°C, 70% 이하 채움',
                tips: [
                  '냉장고 안쪽이 가장 차갑고, 문쪽이 가장 따뜻함 (계란·우유는 안쪽 권장)',
                  '날 것과 익힌 음식은 분리 — 교차 오염 방지',
                  '뜨거운 음식은 식힌 후 넣기 (냉장고 온도 상승 방지)',
                ],
              },
              {
                icon: '🧊', name: '냉동 보관',  c: '#B885DA',
                temp: '−18°C 이하, 진공·밀폐',
                tips: [
                  '1회 사용 분량으로 소분해서 얼리기 (재냉동 절대 금지)',
                  '냉동일자·내용물을 봉지에 적기',
                  '냉동했다고 무한 보관 가능한 게 아님 — 풍미·식감 저하 시작',
                ],
              },
            ].map((g, i) => (
              <div key={i} style={{
                background: 'var(--bg2)',
                border: `1px solid ${g.c}44`,
                borderLeft: `3px solid ${g.c}`,
                borderRadius: '12px',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px' }}>{g.icon}</span>
                  <span style={{ fontSize: '15px', color: g.c, fontWeight: 700 }}>{g.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: 'auto', fontFamily: 'Inter, system-ui, sans-serif' }}>{g.temp}</span>
                </div>
                <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: '6px 0 0' }}>
                  {g.tips.map((t, j) => <li key={j}>{t}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 냉장 → 냉동 전환 권장 기준 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            냉장 → 냉동 전환 권장 기준
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
            냉장 며칠 안에 못 먹을 것 같다면, 미리 냉동으로 옮기세요.
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 460 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['식재료', '냉장 → 냉동 전환 권장', '냉동 후 보관'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '소·돼지·닭고기 (생)', a: '구입 후 1일 이내', b: '4~9개월' },
                  { n: '다진 고기',           a: '구입 당일',        b: '3~4개월' },
                  { n: '생선 (생)',           a: '구입 당일',        b: '3~4개월' },
                  { n: '익힌 고기·요리',      a: '조리 후 2~3일',    b: '2~3개월' },
                  { n: '국·찌개',             a: '조리 후 2일',      b: '1~2개월' },
                  { n: '밥',                  a: '식자마자',         b: '2~4주' },
                  { n: '빵·식빵',             a: '구입 후 2일',      b: '1~2개월' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: '#B885DA', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ background: 'rgba(184,133,218,0.06)', border: '1px solid rgba(184,133,218,0.25)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: '#B885DA', fontWeight: 700, marginBottom: '6px' }}>💡 냉동 잘하는 법</p>
            <ul style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              <li>1회 사용 분량으로 <strong style={{ color: 'var(--text)' }}>소분 냉동</strong> — 해동·재냉동 사이클을 차단</li>
              <li>완전히 식힌 후 <strong style={{ color: 'var(--text)' }}>밀폐·진공</strong> 포장 (냉동 화상 방지)</li>
              <li>고기는 <strong style={{ color: 'var(--text)' }}>얇게 펴서 평평하게</strong> 얼려야 빠르게 해동됨</li>
            </ul>
          </div>
        </div>

        {/* ── 4. 위험 신호 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            위험 신호 — 절대 먹지 말아야 할 식재료
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
            D-day가 남아도 다음 신호가 보이면 <strong style={{ color: '#DC2626' }}>즉시 폐기</strong>하세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '🥩 고기',   c: '#DC2626', d: '회녹색·회갈색 변색, 끈적한 점성, 시큼하거나 강한 암모니아 냄새' },
              { n: '🐟 생선',   c: '#DC2626', d: '눈이 흐림·움푹 들어감, 비린내가 강하게 시큼함, 살이 으스러짐' },
              { n: '🥚 계란',   c: '#D97706', d: '깼을 때 흰자가 묽음, 노른자 모양 무너짐, 황화수소(썩은 달걀) 냄새' },
              { n: '🥛 우유',   c: '#D97706', d: '응어리지거나 분리됨, 시큼한 냄새, 노란빛으로 변색' },
              { n: '🍚 밥·면',  c: '#EA580C', d: '실 같은 곰팡이, 끈적한 점액, 시큼한 발효 냄새' },
              { n: '🥬 채소',   c: '#059669', d: '검은 반점, 무른 부분, 곰팡이 — 일부분만 변색이라도 전체 폐기' },
              { n: '🍲 국·찌개', c: '#EA580C', d: '표면 거품·기포, 시큼한 냄새, 점성이 생김 (정상 점도와 다름)' },
              { n: '🍞 빵',     c: '#EA580C', d: '곰팡이 (녹·흰·검은색), 한 부분이라도 보이면 전체 폐기' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--bg2)',
                border: `1px solid ${s.c}44`,
                borderRadius: '10px',
                padding: '12px 14px',
              }}>
                <p style={{ fontSize: '13px', color: s.c, fontWeight: 700, marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '14px',
            background: 'rgba(220,38,38,0.06)',
            border: '1px solid rgba(220,38,38,0.25)',
            borderRadius: '12px',
            padding: '14px 18px',
          }}>
            <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 700, marginBottom: '6px' }}>🚫 위험 온도대 (4~60°C)</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              이 온도 범위에서 식중독균이 가장 빠르게 증식합니다. 조리한 음식을 <strong style={{ color: 'var(--text)' }}>2시간 이상 실온</strong>에 두면 (여름철 1시간) 보관 기간과 무관하게 폐기하세요.
            </p>
          </div>
        </div>

        {/* ── 5. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          {FAQ_LD.map((faq, i) => (
            <details key={i} style={faqDetails}>
              <summary style={faqSummary}>Q{i + 1}. {faq.q}</summary>
              <div style={faqAnswer}>{faq.a}</div>
            </details>
          ))}
        </div>

        {/* ── 5.5 참고 기준·출처 ── */}
        <div style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.30)', borderRadius: 12, padding: '18px 20px' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 10 }}>⚖️ 참고 기준·출처</p>
          <p style={{ fontSize: 12.5, color: 'var(--text)', lineHeight: 1.85, marginBottom: 8 }}>
            본 계산기의 보관 기간은 <strong style={{ color: 'var(--text)' }}>일반 정보 제공용 참고값</strong>입니다. 식품 안전 진단·판정 도구가 아닙니다.
          </p>
          <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85, marginBottom: 10 }}>
            <li>식약처 「식품유형별 소비기한 설정 보고서」 — <a href="https://www.foodsafetykorea.go.kr/portal/board/board.do?menu_grp=MENU_NEW01&menu_no=4612" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>식품안전나라 소비기한 자료실 ↗</a></li>
            <li>식품유형별 소비기한 참고값 검색 (한국식품산업협회, 2026년 6월 기준 약 2,000개 품목) — <a href="https://www.kfia.or.kr/kfia/sub.php?menukey=1513" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>kfia.or.kr ↗</a></li>
            <li>소비기한 표시제 Q&A (식약처·대한민국 정책브리핑, 2023년 시행) — <a href="https://www.korea.kr/news/healthView.do?newsId=148911057" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>korea.kr ↗</a></li>
          </ul>
          <p style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 600, marginBottom: 6 }}>식품 안전 도움:</p>
          <ul style={{ paddingLeft: 18, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.85 }}>
            <li>식약처 식품안전정보: <strong style={{ color: '#DC2626' }}>1399</strong></li>
            <li>식품안전나라: <strong style={{ color: '#DC2626' }}>foodsafetykorea.go.kr</strong></li>
            <li>USDA FSIS (영문): fsis.usda.gov</li>
          </ul>
        </div>

        {/* ── 6. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/thawing', icon: '🧊', name: '해동 시간 계산기',  desc: '고기 해동 시간·안전 가이드' },
              { href: '/tools/cooking/serving', icon: '🍽️', name: '1인분 분량 계산기',     desc: '인분별 장보기 분량 가이드' },
              { href: '/tools/cooking/recipe',  icon: '📐', name: '레시피 비율 계산기',     desc: '인분 수에 맞게 재료 비율 조정' },
              { href: '/tools/date/dday',       icon: '📅', name: 'D-day 계산기',          desc: '소비 기한·기념일 D-day' },
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
