import Link from 'next/link'
import ServingClient from './ServingClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/cooking/serving',
  title: '1인분 분량 계산기 — 파스타·고기·쌀 인분별 장보기 + 합산 목록 + 가족 저장',
  description: 'n인분 식단의 재료별 정확한 분량과 합산 장보기 마크다운. 냉장고 재료 빼기·가족 구성 저장·채식·비건·글루텐프리 필터.',
  keywords: ['1인분 분량 계산기', '파스타 1인분', '삼겹살 1인분', '쌀 1인분', '장보기 목록', '인분 환산', '4인분 장보기', '아이 포함 인분', '한국 가정 장보기', '냉장고 정리', '채식 장보기', '글루텐프리'],
})

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

const FAQ_LD = [
  { "q":"파스타 1인분은 몇 그램인가요?","a":"메인 식사 기준 건면 90~110g이 표준입니다. 이탈리아 레스토랑 기준 1인분은 보통 80~100g이지만, 한국인 식사량 기준으로 사이드 없이 먹을 때 100~120g이 적당. 삶으면 약 2.2배(200~240g)로 늘어남." },
  { "q":"삼겹살 3인분이면 몇 g 사야 하나요?","a":"고기만 구워 먹는 경우 1인당 200~250g, 3인이면 600~750g. 쌈채소와 함께면 1인당 180~200g(540~600g), 볶음밥/냉면 마무리 시 1인당 150~180g(450~540g). 마트 삼겹살은 400g·600g·1kg 단위 — 600g 또는 1kg이 3인에 적당." },
  { "q":"소면 2인분은 건면 기준 몇 g인가요?","a":"메인 식사 기준 1인당 80~100g, 2인분은 160~200g. 비빔국수·잔치국수 단독은 상한(200g) 권장. 일반 소면 한 봉(500g)으로 5인분 가능." },
  { "q":"장보기 분량과 실제 먹는 양이 다른 이유는?","a":"고기는 익으면 20~30% 감소, 면은 삶으면 2~2.5배 증가, 쌀은 밥이 되면 2.4배. 본 도구는 마트에서 구입해야 할 조리 전 기준으로 표시. 실제 섭취량은 결과 카드 &ldquo;조리 후 예상량&rdquo; 참고." },
  { "q":"어른 2명 + 아이 1명이면 몇 인분 기준으로 준비하나요?","a":"아이 연령별 환산: 영아(0~3세) 0.25 / 유아(4~6세) 0.40 / 초등(7~13세) 0.65 / 중·고생 0.90 / 성인 1.00. 성인 2 + 초등생 1 = 약 2.65인분. 본 도구의 👪 내 가족 탭에 저장하면 매번 입력 X." },
  { "q":"4인 가족 삼겹살 파티 장보기 어떻게 하나요?","a":"본 도구의 🛒 장보기 목록 탭 활용: 삼겹살 800~1000g (성인 3 + 아이 1) · 쌈채소 300~400g (1~2팩) · 두부 1모 (300g) · 쌀 360g (또는 즉석밥 4개). ⚠️ 추가 메뉴(냉면·볶음밥) 시 고기 -20%, 술 안주 겸 시 +10%. 마트 패키지 단위(1kg) 권장 (남는 건 다음 식사)." },
  { "q":"냉장고에 이미 있는 재료를 어떻게 빼나요?","a":"🛒 장보기 목록 탭에서 각 재료별 &ldquo;📦 냉장고 보유&rdquo;에 g 입력 → 자동 차감. 모두 충분하면 ✓ 구매 X 표시. 장점: 식재료 낭비 ↓, 마트 비용 ↓, 가정 식재료 활용도 ↑. ⚠️ 보관 기한 확인 필수 — 신선 재료는 빠른 사용, 의심스러우면 폐기." },
  { "q":"채식·비건 가족도 본 도구 사용 가능한가요?","a":"네, 식이 제한 필터(채식/비건/글루텐프리) 활용. 해당 재료 자동 숨김. ⚠️ 단순 제외만으로 영양 균형 X — 단백질(콩·두부·렌틸), B12·철분·칼슘 보충 필요. 정확한 식단은 영양사 상담. 본 도구는 일반 가이드." },
  { "q":"본 도구와 레시피 비율 계산기 차이는?","a":"영역이 다릅니다. 📦 본 도구 (1인분 분량): 마트 구입 기준 장보기 분량, 인원·연령·식사량 보정, 복수 재료 합산, 냉장고 빼기. 📐 레시피 비율 계산기: 레시피 자체 비율 환산(4인→6인 비례), 베이커 퍼센트, 재료 간 비율. 추천 흐름: 본 도구로 장보기 → 마트 → 레시피 비율로 정확 비율 → 단위 변환 → 요리." },
  { "q":"가족 구성을 매번 입력하는 게 번거로워요.","a":"👪 내 가족 탭 활용 (localStorage): 가족 구성 입력 (이름·연령·식사량) → 자동 인분 환산 계수 표시 (예: 성인 1.00, 초등생 0.65) → 다음 방문 시 자동 불러오기. 인원 입력 박스에서 &ldquo;저장된 가족 구성 적용&rdquo; 체크 시 즉시 적용됩니다. ⚠️ 본인 브라우저(localStorage)에만 저장되며 서버로 전송되지 않습니다. 브라우저 데이터 삭제 시 사라집니다." }
]

export default function ServingPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="cooking" />1인분 분량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        n인분 식단의 재료별 정확한 분량과 <strong style={{ color: 'var(--text)' }}>합산 장보기</strong>. 채식·비건·글루텐프리 필터.
      </p>

      <ServingClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 빠른 참조표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            재료별 1인분 기준 빠른 참조표
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
            메인 식사·보통 식사량·성인 기준의 일반 근사치입니다. 고기류는 밥·면 없이 <strong style={{ color: 'var(--text)' }}>고기 위주</strong>로 먹을 때 기준이며, 밥·면을 곁들이면 그만큼 줄어듭니다. 위 계산기는 인원·연령·식사량·탄수화물 포함 여부를 반영해 더 정확하게 계산합니다.
          </p>

          {/* 면류 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🍝 면류 (건면 기준)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1인분', '2인분', '4인분', '조리 후'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '파스타',       a: '90~110g',   b: '180~220g',  c: '360~440g',  d: '약 2.2배' },
                  { n: '소면',         a: '80~100g',   b: '160~200g',  c: '320~400g',  d: '약 2.5배' },
                  { n: '우동면 (생)',  a: '180~220g',  b: '360~440g',  c: '720~880g',  d: '그대로' },
                  { n: '쌀국수면',     a: '70~90g',    b: '140~180g',  c: '280~360g',  d: '약 2.3배' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 고기류 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🥩 고기류 (생고기 기준)</h3>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1인분', '2인분', '4인분', '조리 후'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '소고기 구이',   a: '180~220g', b: '360~440g', c: '720~880g',  d: '약 75%' },
                  { n: '소불고기',      a: '150~200g', b: '300~400g', c: '600~800g',  d: '약 80%' },
                  { n: '삼겹살 구이',   a: '200~250g', b: '400~500g', c: '800~1000g', d: '약 75%' },
                  { n: '닭가슴살',      a: '130~170g', b: '260~340g', c: '520~680g',  d: '약 75%' },
                  { n: '샤브샤브',      a: '130~170g', b: '260~340g', c: '520~680g',  d: '약 85%' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 쌀 */}
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>🍚 쌀 (생쌀 기준)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 520 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료', '1인분', '2인분', '4인분', '밥이 되면'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '9px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { n: '흰쌀',     a: '85~95g',  b: '170~190g', c: '340~380g', d: '약 2.4배' },
                  { n: '현미',     a: '90~100g', b: '180~200g', c: '360~400g', d: '약 2.2배' },
                  { n: '죽용 쌀',  a: '40~50g',  b: '80~100g',  c: '160~200g', d: '약 5~6배' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontWeight: 500 }}>{r.n}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.a}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.b}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--text)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.c}</td>
                    <td style={{ padding: '9px 10px', color: 'var(--muted)' }}>{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 2. 조리 전/후 중량 변화 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            조리 전 / 후 중량 변화 완전 가이드
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', marginBottom: '14px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>왜 건면·생고기 기준인가</p>
            <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
              <li>마트에서 파는 단위가 <strong style={{ color: 'var(--text)' }}>조리 전 기준</strong>이기 때문</li>
              <li>조리 후 무게는 재료·조리법·시간마다 크게 달라짐</li>
              <li>장보기 기준으로는 조리 전이 가장 실용적</li>
            </ul>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['재료 유형', '변화율', '예시'].map((h, i) => (
                    <th scope="col" key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { t: '면류',          p: '+100~150%',  e: '건면 100g → 삶은 면 200~250g' },
                  { t: '고기',          p: '−20~30%',    e: '생고기 100g → 익은 고기 70~80g' },
                  { t: '쌀',            p: '+120~140%',  e: '생쌀 100g → 밥 220~240g' },
                  { t: '채소 (손질 전)', p: '−10~20%',    e: '손질 전 100g → 손질 후 80~90g' },
                  { t: '채소 (볶음)',    p: '−30~40%',    e: '생채소 100g → 볶은 채소 60~70g' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.t}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.p}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{r.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 3. 상황별 분량 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            상황별 분량 가이드
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { title: '🥩 삼겹살 파티 3인 (성인)', items: [
                { label: '고기만 먹는 경우', v: '1인당 250g = 750g' },
                { label: '쌈채소 포함 시', v: '1인당 200g = 600g' },
                { label: '냉면/볶음밥 함께 시', v: '1인당 150g = 450g' },
              ] },
              { title: '🍝 파스타 4인 (메인, 사이드 없음)', items: [
                { label: '일반 식사', v: '400~440g' },
                { label: '많이 먹는 편', v: '480~520g' },
                { label: '크림 소스 (무거운 소스)', v: '360~400g' },
              ] },
              { title: '🍲 샤브샤브 세팅 2인', items: [
                { label: '고기', v: '300~360g' },
                { label: '두부', v: '1모 (300~350g)' },
                { label: '채소', v: '200~250g' },
                { label: '면사리 (선택)', v: '200g' },
              ] },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 700, marginBottom: '10px' }}>{g.title}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {g.items.map((it, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: 'var(--muted)' }}>{it.label}</span>
                      <span style={{ color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{it.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 아이 포함 분량 조정 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            아이 포함 시 분량 조정 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '14px' }}>
            연령별 성인 대비 식사량 비율입니다. 이 비율을 성인 인분에 곱해 전체 분량을 계산합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            {[
              { age: '영아 (만 3세 이하)',    pct: '약 25%', c: '#0891B2' },
              { age: '유아 (만 4~6세)',      pct: '약 40%', c: '#059669' },
              { age: '초등 (만 7~13세)',     pct: '약 65%', c: '#0EA5E9' },
              { age: '중·고생 (만 14~17세)',  pct: '약 90%', c: '#D97706' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.c}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{g.age}</p>
                <p style={{ fontSize: '18px', color: g.c, fontWeight: 700, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', margin: 0 }}>{g.pct}</p>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '6px' }}>💡 계산 예시</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>
              성인 2명 + 초등생(10세) 1명 = 2 + 0.65 = <strong>2.65인분</strong>으로 계산
            </p>
          </div>
        </div>

        {/* ── 5. 요리 유형별 고기 분량 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            요리 유형별 고기 분량이 달라지는 이유
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { n: '🔥 구이',             c: '#D97706', d: '고기가 메인 — 1인당 200~250g 필요' },
              { n: '🍳 볶음 (제육·불고기)', c: '#EA580C', d: '양념·채소가 섞여 포만감 증가 — 1인당 150~180g' },
              { n: '🍲 국·찌개',          c: '#0891B2', d: '국물이 포만감을 채움 — 1인당 100~130g' },
              { n: '♨️ 전골·샤브샤브',     c: '#B885DA', d: '채소·두부·면사리와 함께 — 1인당 120~150g' },
              { n: '🥣 육수 베이스 (설렁탕)', c: '#059669', d: '뼈 포함으로 무게 증가 — 1인당 300~400g (뼈 포함)' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.c}44`, borderLeft: `3px solid ${s.c}`, borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', color: s.c, fontWeight: 700, marginBottom: '4px' }}>{s.n}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 복수 재료 합산 장보기 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🛒 복수 재료 합산 장보기 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            본 도구의 <strong style={{ color: 'var(--text)' }}>🛒 장보기 목록</strong> 탭에서 여러 재료를 한 번에 합산하고 마크다운 카드로 복사. 한국 가정 자주 먹는 메뉴별 4인 기준 장보기.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { title: '🥓 삼겹살 파티 (4인)', items: '삼겹살 800~1000g · 쌈채소 300~400g (1팩) · 두부 1모 · 쌀 360g' },
              { title: '🍝 파스타 디너 (4인)', items: '파스타 360~440g · 채소 200g · 치즈 적당량' },
              { title: '♨️ 샤브샤브 (4인)', items: '샤브 소고기 600g · 채소 800~1000g · 두부 1모 · 면사리 2봉' },
              { title: '🍲 김치찌개 (4인)', items: '돼지고기 400g · 묵은김치 400g · 두부 1모 · 쌀 360g' },
              { title: '🍳 제육볶음 (4인)', items: '앞다리살 600g · 양파 1개 · 양배추 200g · 쌀 360g' },
              { title: '🍜 비빔국수 (4인)', items: '소면 320~400g · 채소 200g · 계란 4개' },
            ].map((g, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '4px' }}>{g.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.items}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. 냉장고 재료 활용 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            📦 냉장고 재료 활용 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            본 도구의 장보기 목록 탭에서 각 재료별 <strong style={{ color: 'var(--text)' }}>📦 냉장고 보유</strong> 입력 시 자동으로 사야 할 양에서 차감.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>💡 사용 예시</p>
            <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
              <li>쌀 360g 필요 + 냉장고 100g 보유 → <strong style={{ color: 'var(--accent)' }}>260g만 구매</strong></li>
              <li>두부 1모 필요 + 1/2모 보유 → 1/2모만</li>
              <li>모든 재료 충분 → ✓ 구매 X 표시</li>
            </ul>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7, marginBottom: 0 }}>
              ⚠️ 보관 기한 확인 — 신선 재료는 빠른 사용, 의심스러우면 폐기. 냉동 보관은 <Link href="/tools/cooking/thawing" style={{ color: 'var(--accent)' }}>해동 시간 도구</Link>로 안전 해동. 식약처 식품안전 1399.
            </p>
          </div>
        </div>

        {/* ── 8. 채식·비건·식이 제한 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🥬 채식·비건·식이 제한 가이드
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '14px' }}>
            본 도구의 식이 제한 칩으로 해당 그룹 재료 자동 필터링.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { name: '🥬 채식', color: '#059669', desc: '고기·생선 자동 제외. 두부·계란·우유·치즈는 포함.' },
              { name: '🌱 비건', color: '#0EA5E9', desc: '모든 동물성 제외 (고기·생선·계란·우유 X). 단백질은 콩·두부·렌틸로 보충.' },
              { name: '🌾 글루텐프리', color: '#D97706', desc: '밀가루 면류 자동 제외. 쌀국수면·당면·메밀국수는 OK.' },
            ].map((d, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${d.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
                <p style={{ fontSize: '13px', color: d.color, fontWeight: 700, marginBottom: '6px' }}>{d.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{d.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '14px', lineHeight: 1.7 }}>
            ⚠️ 단순 제외만으로 영양 균형 X — 단백질·B12·철분·칼슘 보충 필수. 견과류 알레르기는 의사 상담. 본 도구는 <strong>일반 가이드</strong>이며 정확한 식단·영양 자문은 영양사 영역.
          </p>
        </div>

        {/* ── 9. 다른 cooking 도구 동선 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🍳 cooking 도구 추천 동선
          </h2>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px' }}>
            <ol style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 2, paddingLeft: 24, margin: 0 }}>
              <li><strong style={{ color: 'var(--accent)' }}>본 도구</strong>로 장보기 분량 결정 ⭐</li>
              <li><Link href="/tools/life/unit-price" style={{ color: 'var(--accent)' }}>단가 비교</Link>로 마트 가격 분석</li>
              <li><Link href="/tools/cooking/substitute" style={{ color: 'var(--accent)' }}>식재료 대체 비율</Link>로 부족 시 대체</li>
              <li><Link href="/tools/cooking/recipe" style={{ color: 'var(--accent)' }}>레시피 비율</Link>로 정확 비율 환산</li>
              <li><Link href="/tools/cooking/thawing" style={{ color: 'var(--accent)' }}>냉동·해동 시간</Link>으로 안전 해동</li>
              <li>요리 시작!</li>
            </ol>
          </div>
        </div>

        {/* ── 10. FAQ (accordion + 5 new) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />

          <details style={faqDetails}>
            <summary style={faqSummary}>Q1. 파스타 1인분은 몇 그램인가요?</summary>
            <div style={faqAnswer}>
              메인 식사 기준 건면 <strong style={{ color: 'var(--text)' }}>90~110g</strong>이 표준입니다. 이탈리아 레스토랑 기준 1인분은 보통 80~100g이지만, 한국인 식사량 기준으로 사이드 없이 먹을 때 100~120g이 적당. 삶으면 약 2.2배(200~240g)로 늘어남.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q2. 삼겹살 3인분이면 몇 g 사야 하나요?</summary>
            <div style={faqAnswer}>
              고기만 구워 먹는 경우 1인당 200~250g, 3인이면 <strong style={{ color: 'var(--text)' }}>600~750g</strong>. 쌈채소와 함께면 1인당 180~200g(540~600g), 볶음밥/냉면 마무리 시 1인당 150~180g(450~540g). 마트 삼겹살은 400g·600g·1kg 단위 — 600g 또는 1kg이 3인에 적당.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q3. 소면 2인분은 건면 기준 몇 g인가요?</summary>
            <div style={faqAnswer}>
              메인 식사 기준 1인당 80~100g, 2인분은 <strong style={{ color: 'var(--text)' }}>160~200g</strong>. 비빔국수·잔치국수 단독은 상한(200g) 권장. 일반 소면 한 봉(500g)으로 5인분 가능.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q4. 장보기 분량과 실제 먹는 양이 다른 이유는?</summary>
            <div style={faqAnswer}>
              고기는 익으면 20~30% 감소, 면은 삶으면 2~2.5배 증가, 쌀은 밥이 되면 2.4배. 본 도구는 마트에서 구입해야 할 <strong style={{ color: 'var(--text)' }}>조리 전 기준</strong>으로 표시. 실제 섭취량은 결과 카드 &ldquo;조리 후 예상량&rdquo; 참고.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q5. 어른 2명 + 아이 1명이면 몇 인분 기준으로 준비하나요?</summary>
            <div style={faqAnswer}>
              아이 연령별 환산: 영아(0~3세) 0.25 / 유아(4~6세) 0.40 / 초등(7~13세) 0.65 / 중·고생 0.90 / 성인 1.00. 성인 2 + 초등생 1 = 약 <strong style={{ color: 'var(--text)' }}>2.65인분</strong>. 본 도구의 <strong>👪 내 가족</strong> 탭에 저장하면 매번 입력 X.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q6. 4인 가족 삼겹살 파티 장보기 어떻게 하나요?</summary>
            <div style={faqAnswer}>
              본 도구의 <strong style={{ color: 'var(--text)' }}>🛒 장보기 목록</strong> 탭 활용:
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>삼겹살 800~1000g (성인 3 + 아이 1)</li>
                <li>쌈채소 300~400g (1~2팩)</li>
                <li>두부 1모 (300g)</li>
                <li>쌀 360g (또는 즉석밥 4개)</li>
              </ul>
              ⚠️ 추가 메뉴(냉면·볶음밥) 시 고기 -20%, 술 안주 겸 시 +10%. 마트 패키지 단위(1kg) 권장 (남는 건 다음 식사).
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q7. 냉장고에 이미 있는 재료를 어떻게 빼나요?</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>🛒 장보기 목록 탭</strong>에서 각 재료별 &ldquo;📦 냉장고 보유&rdquo;에 g 입력 → 자동 차감. 모두 충분하면 ✓ 구매 X 표시.
              <br />장점: 식재료 낭비 ↓, 마트 비용 ↓, 가정 식재료 활용도 ↑.
              <br />⚠️ 보관 기한 확인 필수 — 신선 재료는 빠른 사용, 의심스러우면 폐기.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q8. 채식·비건 가족도 본 도구 사용 가능한가요?</summary>
            <div style={faqAnswer}>
              네, <strong style={{ color: 'var(--text)' }}>식이 제한 필터</strong>(채식/비건/글루텐프리) 활용. 해당 재료 자동 숨김.
              <br />⚠️ 단순 제외만으로 영양 균형 X — 단백질(콩·두부·렌틸), B12·철분·칼슘 보충 필요. 정확한 식단은 영양사 상담. 본 도구는 일반 가이드.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q9. 본 도구와 레시피 비율 계산기 차이는?</summary>
            <div style={faqAnswer}>
              영역이 다릅니다.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>📦 <strong style={{ color: 'var(--text)' }}>본 도구 (1인분 분량)</strong>: 마트 구입 기준 장보기 분량, 인원·연령·식사량 보정, 복수 재료 합산, 냉장고 빼기.</li>
                <li>📐 <Link href="/tools/cooking/recipe" style={{ color: 'var(--accent)' }}>레시피 비율 계산기</Link>: 레시피 자체 비율 환산(4인→6인 비례), 베이커 퍼센트, 재료 간 비율.</li>
              </ul>
              추천 흐름: 본 도구로 장보기 → 마트 → 레시피 비율로 정확 비율 → 단위 변환 → 요리.
            </div>
          </details>

          <details style={faqDetails}>
            <summary style={faqSummary}>Q10. 가족 구성을 매번 입력하는 게 번거로워요.</summary>
            <div style={faqAnswer}>
              <strong style={{ color: 'var(--text)' }}>👪 내 가족 탭</strong> 활용 (localStorage):
              <ol style={{ paddingLeft: 18, marginTop: 8 }}>
                <li>가족 구성 입력 (이름·연령·식사량)</li>
                <li>자동 인분 환산 계수 표시 (예: 성인 1.00, 초등생 0.65)</li>
                <li>다음 방문 시 자동 불러오기</li>
                <li>인원 입력 박스에서 &ldquo;저장된 가족 구성 적용&rdquo; 체크 → 즉시 적용</li>
              </ol>
              ⚠️ 본인 브라우저(localStorage)에만 저장. 서버 전송 X. 브라우저 데이터 삭제 시 사라짐.
            </div>
          </details>
        </div>

        {/* ── 11. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/cooking/recipe',         icon: '📐', name: '레시피 비율 계산기',         desc: '인분 환산·비율 조정' },
              { href: '/tools/cooking/substitute',     icon: '🔄', name: '식재료 대체 비율',           desc: '부족 시 대체재' },
              { href: '/tools/cooking/thawing',        icon: '🧊', name: '해동 시간 계산기',      desc: '고기·냉동 안전 해동' },
              { href: '/tools/life/unit-price',        icon: '🏷️', name: '단가 비교 계산기',           desc: '마트 가격 분석' },
              { href: '/tools/cooking/nuts',           icon: '🥜', name: '견과류 적정량',              desc: '간식·영양 보충' },
              { href: '/tools/cooking/baking-recipe',  icon: '🧁', name: '베이킹 레시피',              desc: '제과 비율 환산' },
              { href: '/tools/life/dutch',             icon: '🍻', name: '더치페이 계산기',            desc: '외식 정산' },
            ].map((t) => (
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
