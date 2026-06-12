import Link from 'next/link'
import FruitSyrupClient from './FruitSyrupClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/cooking/fruit-syrup',
  title: '과일청 담그기 계산기 — 매실청·레몬청 설탕 비율·숙성 일정·보관',
  description:
    '매실청·레몬청·유자청·생강청 등 과일청 설탕 비율(1:1) 계산 + 담금 총 중량·필요 유리병 크기·숙성 D-day 일정·완성 원액 추정. 제철 과일 캘린더와 보관 궁합까지.',
  keywords: [
    '과일청', '과일청 설탕 비율', '매실청 설탕 비율', '매실청 담그기', '레몬청 비율',
    '유자청 담그기', '생강청', '청 담그기', '효소 비율', '과일청 숙성 기간',
    '제철 과일', '과일 보관법', '과일 에틸렌', '매실청 100일',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 18px',
}
const ACCENT = '#D97706'

const FAQ_LD = [
              {
                q: '설탕을 줄여서 담가도 되나요?',
                a: '가능하지만 보존성이 떨어집니다. 1:0.8까지는 무난하지만 그 이하로 줄이면 발효가 과해지거나 곰팡이 위험이 커집니다. 저당으로 담갔다면 <strong>반드시 냉장 보관</strong>하고 1~2개월 내에 소비하세요. 올리고당·꿀로 일부 대체할 수도 있습니다.',
              },
              {
                q: '설탕이 끝까지 안 녹고 바닥에 굳었어요.',
                a: '저어주기가 부족했을 때 생깁니다. 설탕이 다 녹을 때까지 하루 1회 위아래로 섞어주세요. 이미 굳었다면 병을 따뜻한 곳에 두고 자주 흔들어 녹이거나, 살짝 중탕하면 풀립니다.',
              },
              {
                q: '흰 곰팡이·거품이 생겼는데 먹어도 되나요?',
                a: '표면에 <strong>흰 거품(기포)</strong>은 발효 과정일 수 있으나, <strong>곰팡이(솜털·점)나 이취·시큼한 알코올 냄새</strong>가 나면 먹지 말고 폐기하세요. 물기 혼입·설탕 부족·온도가 원인입니다. 안전이 우선입니다.',
              },
              {
                q: '과일은 언제 건져내야 하나요?',
                a: '과일에 따라 다릅니다. 매실·오미자·모과처럼 떫은맛이 우러나는 과일은 100일(모과 30일) 전후에 건져냅니다. 레몬·자몽은 오래 두면 쓴맛이 강해져 1~2주 후 건지는 것이 좋습니다. 유자·생강·청귤은 건더기째 두고 청차로 즐겨도 됩니다.',
              },
              {
                q: '얼마나 숙성해야 마실 수 있나요?',
                a: '딸기·레몬은 며칠이면 사용 가능하지만, 매실·오미자는 100일 이상 숙성해야 풍미가 완성됩니다. 계산기에서 담근 날짜를 입력하면 과일별 사용 가능일·건지기·소비기한이 자동으로 표시됩니다.',
              },
              {
                q: '완성된 청은 어떻게 마시나요?',
                a: '원액을 물이나 탄산수에 <strong>1:7~1:10</strong> 비율로 희석해 마십니다. 따뜻한 물에 타면 차, 요거트·드레싱·고기 양념에도 활용합니다. 계산기가 완성 원액으로 만들 수 있는 음료 잔 수를 근사치로 알려줍니다.',
              },
            ]

export default function FruitSyrupPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🍯 과일청 담그기 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        매실청·레몬청·유자청·생강청까지 — <strong style={{ color: 'var(--text)' }}>설탕 비율·필요한 유리병 크기·숙성 일정</strong>을 한 번에.
      </p>

      <FruitSyrupClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 왜 1:1인가 */}
        <section>
          <h2 style={sectionTitle}>과일청, 왜 설탕 1:1 비율이 기본일까?</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            과일청·효소의 설탕은 단순히 단맛을 내는 재료가 아니라 <strong style={{ color: 'var(--text)' }}>보존제</strong> 역할을 합니다. 설탕이 과일 속 수분을 끌어내 삼투압을 높이면, 곰팡이·잡균이 살기 어려운 환경이 만들어집니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            그래서 <strong style={{ color: 'var(--text)' }}>과일 : 설탕 = 1 : 1</strong>이 실패 없는 표준입니다. 설탕을 너무 줄이면(1:0.5 이하) 발효가 과해지거나 곰팡이가 피기 쉽고, 너무 늘리면 끝까지 녹지 않고 바닥에 굳습니다. 저당으로 담그고 싶다면 1:0.8까지가 무난하며, 대신 <strong style={{ color: 'var(--text)' }}>반드시 냉장 보관</strong>하고 빨리 소비하세요.
          </p>
          <div style={{ ...card, borderLeft: `3px solid ${ACCENT}` }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8, margin: 0 }}>
              💡 <strong style={{ color: 'var(--text)' }}>핵심은 위생</strong> — 과일과 용기의 물기를 완전히 제거하는 것이 비율보다 중요합니다. 물 한 방울이 곰팡이의 시작입니다.
            </p>
          </div>
        </section>

        {/* 2. 담그는 법 */}
        <section>
          <h2 style={sectionTitle}>실패 없이 담그는 법 — 5단계</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '1', title: '세척 & 물기 제거', desc: '과일을 깨끗이 씻고 채반에 받쳐 물기를 완전히 말립니다. 유리병도 열탕소독 후 바싹 건조하세요.' },
              { step: '2', title: '손질', desc: '과일별로 슬라이스·채썰기·꼭지 제거 등 손질합니다. (계산기에서 과일을 고르면 손질 팁이 표시됩니다)' },
              { step: '3', title: '켜켜이 담기', desc: '과일과 설탕을 번갈아 켜켜이 쌓고, 맨 위는 설탕으로 두껍게 덮어 공기와의 접촉을 막습니다.' },
              { step: '4', title: '저어주기', desc: '설탕이 다 녹을 때까지 며칠간 하루 1회 위아래로 섞어줍니다. 바닥에 가라앉은 설탕이 굳지 않게 합니다.' },
              { step: '5', title: '숙성 & 건지기', desc: '서늘한 곳에서 숙성하고, 과일에 따라 일정 시점에 건더기를 걸러낸 뒤 냉장 보관합니다.' },
            ].map(item => (
              <div key={item.step} style={{ ...card, display: 'flex', gap: '14px' }}>
                <span style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '18px', fontWeight: 800, color: ACCENT, minWidth: '22px' }}>{item.step}</span>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>{item.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 제철 과일 캘린더 */}
        <section>
          <h2 style={sectionTitle}>제철 과일 캘린더 — 청 담그기 좋은 때</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            제철에 담가야 가장 향이 진하고 값도 쌉니다. 특히 <strong style={{ color: 'var(--text)' }}>매실은 5~6월 단 2~3주</strong>가 사실상 유일한 시기예요.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 420 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>시기</th>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'left', color: ACCENT, fontWeight: 700 }}>제철 과일</th>
                  <th scope="col" style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>추천 청</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['1~4월',   '딸기', '딸기청 (냉장·단기)'],
                  ['5~6월',   '매실(청매실)', '매실청 — 1년 농사, 이때만!'],
                  ['8~9월',   '청귤·자두', '청귤청'],
                  ['9~10월',  '오미자·사과', '오미자청·사과청'],
                  ['10~11월', '모과·생강', '모과청·생강청'],
                  ['11~12월', '유자·자몽', '유자청·자몽청'],
                  ['연중',    '레몬', '레몬청 (겨울이 제맛)'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', fontWeight: 700, color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', whiteSpace: 'nowrap' }}>{r[0]}</td>
                    <td style={{ padding: '9px 10px', color: ACCENT, fontWeight: 600 }}>{r[1]}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. 과일 보관 궁합 */}
        <section>
          <h2 style={sectionTitle}>과일 보관 궁합 — 같이 두면 빨리 무릅니다</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
            일부 과일은 <strong style={{ color: 'var(--text)' }}>에틸렌 가스</strong>를 많이 내뿜어 주변 과일·채소의 숙성·부패를 앞당깁니다. 청을 담그려고 사둔 과일이 금세 무르지 않도록, 보관 궁합을 알아두세요.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ ...card, borderLeft: '3px solid #DC2626' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', marginBottom: '8px' }}>에틸렌 多 (따로 보관)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 사과 · 바나나 · 복숭아</li>
                <li>· 토마토 · 멜론 · 망고</li>
                <li>· 배 · 살구 · 아보카도</li>
              </ul>
            </div>
            <div style={{ ...card, borderLeft: '3px solid #0891B2' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#0891B2', marginBottom: '8px' }}>에틸렌 민감 (멀리 둘 것)</p>
              <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0 }}>
                <li>· 키위 · 딸기 · 포도</li>
                <li>· 감귤류(레몬·오렌지)</li>
                <li>· 잎채소 · 오이 · 브로콜리</li>
              </ul>
            </div>
          </div>
          <div style={{ ...card }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: 0 }}>
              <strong style={{ color: 'var(--text)' }}>활용 팁</strong> — 덜 익은 과일은 사과·바나나와 종이봉투에 함께 넣어두면 빨리 익습니다(후숙). 반대로 오래 두고 싶다면 에틸렌 과일과 떨어뜨려 보관하세요. 감자 옆에 사과를 두면 싹이 늦게 납니다.
            </p>
          </div>
        </section>

        {/* 5. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={{ ...card, padding: '12px 16px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Q{i + 1}. {f.q}</summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }} dangerouslySetInnerHTML={{ __html: f.a }} />
              </details>
            ))}
          </div>
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/kimjang',      icon: '🥬', name: '김장 양 계산기',     desc: '배추·양념·비용 자동 계산' },
              { href: '/tools/cooking/food-storage', icon: '🧊', name: '식재료 보관 계산기', desc: '냉장·냉동 보관 기한 관리' },
              { href: '/tools/cooking/recipe',       icon: '📐', name: '레시피 비율 계산기', desc: '인분·단위 환산' },
              { href: '/tools/date/dday',            icon: '📅', name: 'D-Day 계산기',       desc: '숙성 완료일 카운트다운' },
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
        </section>

      </div>
    </div>
  )
}
