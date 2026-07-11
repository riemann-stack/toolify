import Link from 'next/link'
import CakePanClient from './CakePanClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import Faq from '@/components/Faq'
import UpdatedMeta from '@/components/UpdatedMeta'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/cooking/cake-pan',
  title: '케이크 팬 호수 변환 계산기 — 1호·2호·3호 레시피 배율',
  description: '케이크 팬 호수(1호 15cm~) 변환 계산기. 원형·사각·무스링 부피 기준 레시피 배율 자동 + 호수↔인치 대응·인원수·굽기 보정 가이드.',
  keywords: [
    '케이크 팬 호수', '케이크 1호 크기', '2호 케이크 사이즈', '베이킹 틀 변환',
    '레시피 배율 계산', '제누와즈 틀 크기', '무스링 사이즈', '케이크 호수별 인원',
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
    q: '케이크 1호는 몇 cm인가요?',
    a: '한국 원형 케이크 팬 기준 <strong>1호 = 지름 15cm</strong>이고, 호수가 1 오를 때마다 지름이 3cm씩 커집니다(2호 18cm, 3호 21cm, 4호 24cm, 5호 27cm). 미니는 판매처에 따라 11.3~12cm로 약간 편차가 있어요. 참고로 제과점의 완성 케이크는 아이싱 두께 때문에 1호를 16cm로 표기하는 곳도 있으니, 팬 기준인지 완성 케이크 기준인지 구분해야 합니다.',
  },
  {
    q: '1호 레시피를 2호로 바꾸면 재료를 몇 배 해야 하나요?',
    a: '같은 높이의 팬이라면 <strong>(지름비)² = (18÷15)² = 1.44배</strong>입니다. 커뮤니티에서는 계산 편의상 &lsquo;1.5배&rsquo;로 반올림해 쓰는 관행이 널리 퍼져 있어요(2호→3호도 1.36배지만 1.5배로 통용). 높이가 다른 팬으로 옮길 때는 <strong>(지름비)² × (높이비)</strong>를 곱해야 합니다 — 예를 들어 무스링(높이 5cm) 레시피를 높은팬(7cm)으로 옮기면 1.4배가 추가로 붙어요. 위 계산기가 정확값과 통용 반올림을 함께 보여줍니다.',
  },
  {
    q: '높은팬과 일반팬은 뭐가 다른가요?',
    a: '한국 원형 팬은 <strong>일반팬 높이 4.5cm / 높은팬 7cm</strong>의 이원 체계로 판매됩니다. 제누와즈(스펀지 시트)를 구워 생크림 케이크를 만들 때는 높은팬 7cm가 사실상 표준이에요. 무스링은 지름 체계(1호 15cm~)는 같지만 높이 5cm가 표준이라, 같은 &lsquo;2호&rsquo;라도 팬 종류에 따라 부피가 최대 1.5배 이상 차이 납니다. 배율 계산에 높이가 꼭 들어가야 하는 이유입니다.',
  },
  {
    q: '미국 레시피의 6인치·8인치 팬은 몇 호인가요?',
    a: '<strong>6인치(15.2cm)≈1호, 7인치(17.8cm)≈2호</strong>는 오차 0.3cm 이내로 사실상 같습니다. <strong>8인치(20.3cm)는 3호(21cm)보다 0.7cm 작고, 9인치(22.9cm)는 약 3.6호</strong>로 정확히 대응하는 호수가 없어요. 또 미국 표준 케이크팬은 높이 2인치(5cm)로 한국 높은팬(7cm)과 다르고, 미국 레시피는 8~9인치 팬 2개(2단)를 쓰는 경우가 많아 단순 지름 비교만으로 환산하면 어긋납니다 — 위 계산기에 실제 치수를 넣는 게 정확합니다.',
  },
  {
    q: '호수별로 몇 인분인가요?',
    a: '케이크샵 관행 기준 <strong>미니(12cm) 1~2인, 1호 2~3인, 2호 4~5인, 3호 6~8인, 4호 8~12인</strong> 정도로 안내되지만, 가게마다 표기가 크게 다릅니다(1호를 4~6인분으로 쓰는 곳도 있어요). 식사 후 디저트로 먹는 자리라면 한 치수 작게 잡아도 충분하다는 팁이 커뮤니티 공통 조언입니다.',
  },
  {
    q: '팬을 키우면 굽는 시간·온도는 어떻게 바꾸나요?',
    a: '공식적인 정량 규칙은 없습니다. 확실한 것은 <strong>시간을 배율만큼 비례 계산하면 안 된다</strong>는 점이에요 — 굽는 시간은 반죽 양이 아니라 두께에 좌우됩니다. 통용 관행은 팬이 커지거나 깊어지면 온도를 조금 낮추고 시간을 5분 단위로 늘려가며 <strong>꼬치 테스트</strong>(중앙에 찔러 반죽이 안 묻어나면 완료)로 판정하는 것. 실측 사례로 2호 제누와즈 170℃ 30~35분이 3호에서 약 40분 정도였습니다.',
  },
  {
    q: '파운드팬·사각팬도 호수가 있나요?',
    a: '원형만큼 표준화되어 있지 않습니다. 사각팬은 판매처마다 자체 체계를 쓰고(같은 &lsquo;1호&rsquo;가 13.5cm인 곳도 14.5cm인 곳도 있음), <strong>파운드(오란다)팬은 &lsquo;대/중/소&rsquo; 라벨이 판매처마다 전혀 다른 실물</strong>을 가리켜 표준 규격이 없어요. 그래서 이 계산기는 사각·파운드팬을 가로×세로×높이 실측 입력 방식으로 지원합니다. 자로 재서 넣는 게 가장 정확합니다.',
  },
]

const RELATED = [
  { href: '/tools/cooking/baking-recipe', icon: '🧁', name: '제과 레시피 계산기', desc: '10종 반죽 비율·틀 용량' },
  { href: '/tools/cooking/baker-percent', icon: '🥖', name: '베이커 퍼센트 계산기', desc: '밀가루 100% 기준 비율' },
  { href: '/tools/cooking/baking-schedule', icon: '🍞', name: '제빵 타임라인 계산기', desc: '완성 시각 역산 일정' },
  { href: '/tools/cooking/recipe', icon: '📐', name: '레시피 비율 계산기', desc: '인분 바꾸면 재료 자동' },
  { href: '/tools/unit/converter', icon: '📏', name: '단위 변환기', desc: 'cm↔인치·g↔온스' },
  { href: '/tools/cooking/egg-timer', icon: '🥚', name: '계란 삶는 시간 계산기', desc: '크기·익힘별 타이머' },
]

export default function CakePanPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        요리·식품
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="cooking" />케이크 팬 호수 변환 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        1호 레시피를 3호로? — <strong style={{ color: 'var(--text)' }}>팬 부피 기준 정확한 배율</strong>과 통용 반올림을 함께. 원형·사각·무스링 지원.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="베이킹 자재상 판매 규격(1호 15cm·호당 +3cm·높은팬 7cm) 교차 확인"
        sources={[
          { label: '카우2004', href: 'https://www.cow2004.com' },
          { label: '웰베이킹', href: 'https://wellbaking.co.kr' },
        ]}
      />

      <CakePanClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* 1. 배율 공식 */}
        <section>
          <h2 style={sectionTitle}>배율 공식 — 부피비가 정답</h2>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12,
            padding: '18px 20px', fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: 13, color: 'var(--text)', lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>원형 부피</span> = π × (지름÷2)² × 높이</div>
            <div><span style={{ color: 'var(--muted)' }}>배율</span> = 새 팬 부피 ÷ 기준 팬 부피</div>
            <div><span style={{ color: 'var(--muted)' }}>높이 같으면</span> = (지름비)² — 1호→2호 (18/15)² = 1.44배</div>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
            📌 <strong style={{ color: 'var(--text)' }}>높이를 빼먹는 게 가장 흔한 실수:</strong> 무스링(H5cm) 레시피를 높은팬(H7cm)으로 그대로 1.44배 하면
            반죽이 모자랍니다. 1호 무스링→2호 높은팬은 1.44 × (7/5) = <strong style={{ color: 'var(--accent)' }}>약 2.0배</strong>가 맞아요.
          </div>
        </section>

        {/* 2. 호수 체계 */}
        <section>
          <h2 style={sectionTitle}>한국 호수 체계 한눈에</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {[
              { t: '⚪ 원형 팬 (표준화 강함)', d: '1호 15cm 기점, 호당 +3cm. 높이는 일반 4.5 / 높은팬 7cm 이원 체계. 제누와즈용은 높은팬이 표준.' },
              { t: '⭕ 무스링', d: '지름 체계는 원형 팬과 동일(1호 15cm~), 높이만 5cm 표준. 높은형 6~7cm 별도. 떡케이크 틀로도 통용.' },
              { t: '⬜ 사각·파운드 (비표준)', d: '판매처마다 치수가 달라 규격 합의 없음. 오란다팬 대/중/소는 가게마다 전혀 다른 실물 — 실측 입력 권장.' },
            ].map((c, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{c.t}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.75 }}>{c.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. FAQ */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* 4. 관련 도구 */}
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
