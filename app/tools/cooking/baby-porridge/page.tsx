import Link from 'next/link'
import BabyPorridgeClient from './BabyPorridgeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/cooking/baby-porridge',
  title: '이유식 배죽 물양 계산기 — 10배죽·7배죽·진밥',
  description: '이유식 10배죽·7배죽·5배죽·진밥 물양 자동 계산. 불린쌀·생쌀·쌀가루·밥 기준 환산 + 월령별 한 끼 양·큐브 소분 역산까지.',
  keywords: [
    '이유식 배죽', '10배죽 물양', '7배죽 만들기', '이유식 물양 계산',
    '쌀미음 비율', '밥으로 이유식', '이유식 큐브 소분', '중기 이유식 배죽',
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
    q: '10배죽은 쌀 기준인가요, 불린쌀 기준인가요?',
    a: '레시피 플랫폼과 육아 서적에서 가장 널리 쓰이는 기준은 <strong>불린쌀 1 : 물 10</strong>입니다(예: 불린쌀 50g + 물 500ml). 다만 생쌀이나 쌀가루 기준으로 쓰는 경우도 혼재하고, 기준이 달라지면 같은 "10배죽"이라도 되기가 크게 달라집니다. 위 계산기는 기준(불린쌀·생쌀·쌀가루·밥)을 선택하면 자동 환산해 줍니다. 생쌀은 불리면 무게가 약 1.2~1.35배가 돼요.',
  },
  {
    q: '단계별로 몇 배죽을 먹이나요?',
    a: '통용 관행은 <strong>초기(만 4~6개월 시작) 10배죽 미음 → 중기(7~8개월) 7~5배죽 → 후기(9~11개월) 5~3배죽 무른밥 → 완료기(12개월~) 2배죽 진밥</strong>입니다. 같은 단계 안에서도 초반은 묽게, 후반은 되직하게 좁혀가는 게 일반적이에요. 다만 배죽 수는 공식 규격이 아니라 서적·레시피의 관행이라 출처마다 1~2배 차이가 있고, 아기가 잘 먹는 되기가 우선입니다.',
  },
  {
    q: '쌀가루로 만들면 왜 물을 더 넣나요?',
    a: '쌀가루는 입자가 곱아 <strong>수분을 훨씬 많이 흡수</strong>하기 때문에 불린쌀 10배죽과 같은 되기를 내려면 물을 1.5~2배 더 잡아야 합니다. 통용 범위는 <strong>쌀가루 1 : 물 15~20</strong>(예: 쌀가루 15g + 물 300ml = 20배죽, 20g + 320ml = 16배죽)이에요. 쌀가루는 주로 초기 미음에 쓰고, 중기부터는 불린쌀로 넘어가는 게 일반적입니다.',
  },
  {
    q: '밥으로 이유식을 만들어도 되나요?',
    a: '네, 밥죽(밥으로 만드는 배죽)은 널리 쓰이는 시간 절약 방법입니다. 밥은 이미 생쌀의 약 2.2~2.5배 무게로 수분을 머금고 있어서 물을 훨씬 적게 넣어요. 통용 비율은 <strong>초기 밥 1 : 물 5~6, 중기 1 : 3.5 안팎, 후기 1 : 2 안팎</strong>이고, 완료기는 어른 밥에 국물 2~3큰술을 섞은 되기의 진밥이면 충분합니다. 밥알을 아기 단계에 맞게 갈거나 으깨 주세요.',
  },
  {
    q: '한 번에 얼마나 만들어서 소분하나요?',
    a: '<strong>3일분씩 만들어 큐브·이유식 용기에 소분 냉동</strong>하는 관행이 일반적입니다. 예를 들어 중기(하루 2회)라면 3일 × 2회 = 6끼, 한 끼 70~120g 기준으로 6개 용기에 나눠 담아요. 냉동한 이유식은 1~2주 안에 소진하고, 해동 후 재냉동은 피하세요. 위 계산기의 "며칠치 만들까?" 카드가 필요한 쌀·물 양을 역산해 줍니다.',
  },
  {
    q: '배죽 수치의 공식 기준이 있나요?',
    a: '없습니다. 질병관리청 국가건강정보포털의 이유기 보충식 자료는 형태 진행(으깨기→반고형식)과 횟수만 안내하고 <strong>"N배죽" 수치는 공식 문서에 등장하지 않아요</strong>. 배죽 체계는 육아 서적(삐뽀삐뽀 119 이유식 등)과 레시피 플랫폼에서 자리 잡은 통용 관행입니다. 그래서 출처마다 수치가 조금씩 다르고, 이 계산기도 여러 출처의 공통 범위를 기본값으로 삼되 되기 조절을 열어 두었습니다.',
  },
]

const RELATED = [
  { href: '/tools/cooking/recipe', icon: '📐', name: '레시피 비율 계산기', desc: '인분 바꾸면 재료 자동' },
  { href: '/tools/cooking/thawing', icon: '🧊', name: '해동 시간 계산기', desc: '큐브 해동법·시간 비교' },
  { href: '/tools/cooking/food-storage', icon: '🧊', name: '식재료 보관 계산기', desc: '냉장·냉동 보관 기한' },
  { href: '/tools/health/child-height', icon: '📏', name: '자녀 키 예측 계산기', desc: '부모 키로 예상 키' },
  { href: '/tools/cooking/microwave', icon: '🔥', name: '전자레인지 출력 환산기', desc: '와트별 데우기 시간' },
  { href: '/tools/cooking/serving', icon: '🍽️', name: '1인분 분량 계산기', desc: 'n인분 재료 분량' },
]

export default function BabyPorridgePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        요리·식품
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="cooking" />이유식 배죽 물양 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        10배죽부터 진밥까지 — <strong style={{ color: 'var(--text)' }}>불린쌀·생쌀·쌀가루·밥</strong> 어떤 기준이든 물양을 자동 계산. 큐브 소분 역산까지.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="육아 서적·레시피 플랫폼 통용 관행 종합 (배죽은 공식 규격이 아닌 관행 수치)"
        sources={[
          { label: '질병관리청 국가건강정보포털', href: 'https://health.kdca.go.kr' },
        ]}
      />

      <BabyPorridgeClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 배죽이란 */}
        <section>
          <h2 style={sectionTitle}>배죽이란? — 기준부터 정확히</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>N배죽</span> = 불린쌀 1 : 물 N <span style={{ color: 'var(--muted)' }}>(쌀 g : 물 ml)</span></div>
            <div><span style={{ color: 'var(--muted)' }}>예시</span> = 불린쌀 50g + 물 500ml = 10배죽</div>
            <div><span style={{ color: 'var(--muted)' }}>생쌀이라면</span> = 불리면 약 ×1.3 → 생쌀 40g ≈ 불린쌀 52g</div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8, marginTop: 12 }}>
            물 1ml는 약 1g이므로 사실상 무게 비율입니다. 흔한 실수는 <strong style={{ color: 'var(--text)' }}>생쌀 무게에 그대로 10배</strong>를 적용하는 것 —
            불린쌀 기준보다 물이 20~30% 부족해져 생각보다 되직한 미음이 됩니다. 반대로 쌀가루는 수분 흡수가 커서 같은 10배로는 떡처럼 굳어요.
          </p>
        </section>

        {/* 2. 단계별 진행 */}
        <section>
          <h2 style={sectionTitle}>단계별 배죽 진행 로드맵</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['단계', '배죽', '형태', '한 끼 · 횟수'].map((h) => (
                    <th scope="col" key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['초기 (만 4~6개월 시작)', '10배죽 (쌀가루 15~20배)', '미음 — 주르륵 흐름', '30~80g · 1회'],
                  ['중기 (7~8개월)', '7 → 5배죽', '알갱이 있는 죽', '70~120g · 2회'],
                  ['후기 (9~11개월)', '5 → 3배죽', '무른밥', '100~150g · 3회'],
                  ['완료기 (12개월~)', '2배죽', '진밥', '120~200g · 3회'],
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{r[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent-ink)', fontWeight: 700 }}>{r[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[2]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.7 }}>
            ※ 초기 첫 1~2주는 5~25ml(1~5스푼)부터 시작합니다. 배죽 수·한 끼 양 모두 출처(삐뽀삐뽀 119 이유식·레시피 플랫폼·육아 포털) 간 공통 범위이며, 아기의 발달·기호에 맞춘 조절이 우선입니다.
          </p>
        </section>

        {/* 3. 밥죽 */}
        <section>
          <h2 style={sectionTitle}>밥으로 만드는 밥죽 — 시간 절약 치트키</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '🍚 왜 물을 적게 넣나', d: '밥은 이미 생쌀의 약 2.2~2.5배 무게로 수분을 품고 있어요. 10배죽을 밥으로 만들면 밥 1 : 물 5~6으로 수렴합니다.' },
              { t: '⚖️ 단계별 밥죽 비율', d: '초기 밥 1:물 5~6 → 중기 1:3.5 안팎 → 후기 1:2 안팎 → 완료기는 어른 밥 + 국물 2~3큰술 되기.' },
              { t: '🥣 만드는 법', d: '밥+물을 함께 갈거나(초기) 밥알을 으깨며(중기~) 눌어붙지 않게 저어 끓입니다. 단계에 맞는 입자 크기가 포인트.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 5. 관련 도구 */}
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
