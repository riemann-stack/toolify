import type { Metadata } from 'next'
import Link from 'next/link'
import FoodStorageClient from './FoodStorageClient'

export const metadata: Metadata = {
  title: '식재료 보관 기간 계산기 — 냉장·냉동 소비 기한 D-day | Youtil',
  description: '닭고기·생선·익힌 고기·국·밥 등 식재료의 냉장·냉동 보관 기간을 계산합니다. 식약처 권고 기준 · 보관 방식·상태별 D-day 추적 · 냉동 전환 추천 · 빨리 먹어야 할 음식 알림.',
  keywords: ['식재료보관기간계산기', '닭고기냉장며칠', '익힌고기냉장며칠', '국냉장며칠', '밥냉동며칠', '다진고기냉장', '냉동보관기간', '소비기한계산기', '식재료유통기한'],
}

export default function FoodStoragePage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🧊 식재료 보관 기간 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '24px' }}>
        닭고기·생선·익힌 고기·국·밥 등 식재료의 <strong style={{ color: 'var(--text)' }}>냉장·냉동 D-day</strong>를 추적합니다. 식약처 권고 기준 · 보관 방식·상태별 자동 계산 · 냉동 전환 추천 · 빨리 먹어야 할 음식 TOP 3.
      </p>

      {/* ── 면책 조항 (상단) ── */}
      <div style={{
        background: 'rgba(255,140,62,0.06)',
        border: '1px solid rgba(255,140,62,0.25)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '40px',
      }}>
        <p style={{ fontSize: '13px', color: '#FF8C3E', fontWeight: 700, marginBottom: '6px' }}>⚠️ 안내</p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
          본 계산기는 식약처 권고 일반 기준에 따른 <strong style={{ color: 'var(--text)' }}>참고용 정보</strong>입니다. 실제 보관 가능 기간은 냉장고 온도·포장 상태·취급 환경에 따라 크게 달라질 수 있습니다. 색·냄새·점성에 이상이 있다면 D-day와 무관하게 폐기하세요.
        </p>
      </div>

      <FoodStorageClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
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
                  { n: '두부 (개봉)',     s: '개봉',   f: '2~3일',  z: '1~2개월',  m: '물에 담가 매일 갈아주기' },
                  { n: '햄·소시지 (개봉)', s: '개봉',   f: '5~7일',  z: '1~2개월',  m: '진공포장 미개봉은 냉장 2~3주' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.s}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.f}</td>
                    <td style={{ padding: '9px 10px', color: '#B885DA', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.z}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)', fontSize: '11px' }}>{r.m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 보관 방식별 핵심 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            보관 방식별 핵심 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                icon: '🌡️', name: '실온 보관',  c: '#FFD700',
                temp: '15~25°C, 직사광선 X',
                tips: [
                  '바나나·토마토·양파·마늘·감자 등은 실온이 더 적합',
                  '여름철(28°C 이상)에는 실온 식품도 냉장 권장',
                  '쌀·밀가루는 밀폐용기 + 냉암소(서늘하고 어두운 곳)',
                ],
              },
              {
                icon: '❄️', name: '냉장 보관',  c: '#3EC8FF',
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
                  <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: 'auto', fontFamily: 'Syne, sans-serif' }}>{g.temp}</span>
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
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
                  { n: '소·돼지·닭고기 (생)', a: '구입 후 1일 이내', b: '3~6개월' },
                  { n: '다진 고기',           a: '구입 당일',        b: '3~4개월' },
                  { n: '생선 (생)',           a: '구입 당일',        b: '3~4개월' },
                  { n: '익힌 고기·요리',      a: '조리 후 2~3일',    b: '2~3개월' },
                  { n: '국·찌개',             a: '조리 후 2일',      b: '1~2개월' },
                  { n: '밥',                  a: '식자마자',         b: '2~4주' },
                  { n: '빵·식빵',             a: '구입 후 2일',      b: '1~2개월' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '10px 12px', color: '#B885DA', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.b}</td>
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            위험 신호 — 절대 먹지 말아야 할 식재료
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
            D-day가 남아도 다음 신호가 보이면 <strong style={{ color: '#FF6B6B' }}>즉시 폐기</strong>하세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { n: '🥩 고기',   c: '#FF6B6B', d: '회녹색·회갈색 변색, 끈적한 점성, 시큼하거나 강한 암모니아 냄새' },
              { n: '🐟 생선',   c: '#FF6B6B', d: '눈이 흐림·움푹 들어감, 비린내가 강하게 시큼함, 살이 으스러짐' },
              { n: '🥚 계란',   c: '#FFB83E', d: '깼을 때 흰자가 묽음, 노른자 모양 무너짐, 황화수소(썩은 달걀) 냄새' },
              { n: '🥛 우유',   c: '#FFB83E', d: '응어리지거나 분리됨, 시큼한 냄새, 노란빛으로 변색' },
              { n: '🍚 밥·면',  c: '#FF8C3E', d: '실 같은 곰팡이, 끈적한 점액, 시큼한 발효 냄새' },
              { n: '🥬 채소',   c: '#3EFF9B', d: '검은 반점, 무른 부분, 곰팡이 — 일부분만 변색이라도 전체 폐기' },
              { n: '🍲 국·찌개', c: '#FF8C3E', d: '표면 거품·기포, 시큼한 냄새, 점성이 생김 (정상 점도와 다름)' },
              { n: '🍞 빵',     c: '#FF8C3E', d: '곰팡이 (녹·흰·검은색), 한 부분이라도 보이면 전체 폐기' },
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
            background: 'rgba(255,107,107,0.06)',
            border: '1px solid rgba(255,107,107,0.25)',
            borderRadius: '12px',
            padding: '14px 18px',
          }}>
            <p style={{ fontSize: '13px', color: '#FF6B6B', fontWeight: 700, marginBottom: '6px' }}>🚫 위험 온도대 (4~60°C)</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
              이 온도 범위에서 식중독균이 가장 빠르게 증식합니다. 조리한 음식을 <strong style={{ color: 'var(--text)' }}>2시간 이상 실온</strong>에 두면 (여름철 1시간) 보관 기간과 무관하게 폐기하세요.
            </p>
          </div>
        </div>

        {/* ── 5. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '익힌 고기는 냉장고에서 며칠까지 먹을 수 있나요?',
                a: '식약처 권고 기준 조리 후 3~4일 이내가 안전합니다. 단 조리 직후 빠르게 식혀 밀폐 보관했을 때 기준이며, 실온에 2시간 이상 두었거나 여러 번 데워 먹었다면 더 짧아집니다. 4일 안에 못 먹을 것 같다면 1회분씩 소분해 냉동(2~3개월)으로 옮기세요.' },
              { q: '한 번 해동한 고기를 다시 냉동해도 되나요?',
                a: '원칙적으로 재냉동은 권장되지 않습니다. 해동 과정에서 세포가 손상돼 박테리아가 증식하기 좋은 환경이 되고, 다시 얼리면 풍미·식감이 크게 떨어집니다. 다만 \'냉장에서 천천히 해동한 생고기\'를 즉시(2일 이내) 조리한 후라면 익힌 상태로 다시 냉동할 수 있습니다.' },
              { q: '밥은 냉장과 냉동 중 어디에 보관하는 게 좋나요?',
                a: '하루 내에 먹을 거라면 냉장(1~2일), 그 이상이라면 무조건 냉동(2~4주)이 좋습니다. 밥은 0~4°C 냉장 온도에서 전분이 노화돼 굳고 맛이 빠르게 떨어집니다. 갓 지은 밥을 식기 전에 1회분씩 랩이나 밀폐용기에 소분해 바로 냉동하면 막 지은 밥처럼 회복됩니다.' },
              { q: '국·찌개는 냉장고에서 며칠까지 안전한가요?',
                a: '2~3일 이내가 권장 기준입니다. 매번 먹을 때 한 번 더 팔팔 끓이면 표면 박테리아가 사라지지만, 끓이고 식히기를 4~5회 반복하면 풍미가 사라지고 식중독 위험도 누적됩니다. 김치찌개·된장찌개 등 발효 베이스는 4일까지도 가능하지만, 맑은 국·미역국은 2일 안에 먹는 것이 안전합니다.' },
              { q: '우유 유통기한이 지났는데 냄새가 멀쩡하면 먹어도 되나요?',
                a: '미개봉 상태에서 유통기한 1~2일 지난 정도이고 냄새·맛이 멀쩡하다면 대개 안전합니다. 한국의 \'유통기한\'은 판매 가능 기한이고, 실제 \'소비기한\'은 보통 그보다 4~5일 더 깁니다. 단 개봉한 우유는 유통기한과 무관하게 개봉 후 3~5일 이내에 모두 마시세요. 응어리·분리·시큼한 냄새 중 하나라도 있으면 즉시 폐기.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/thawing', icon: '🧊', name: '냉동·해동 시간 계산기',  desc: '고기 해동 시간·안전 가이드' },
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
