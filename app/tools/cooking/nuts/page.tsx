import Link from 'next/link'
import NutsClient from './NutsClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/cooking/nuts',
  title: '견과류 섭취량 계산기 — 12종 알 수·혼합·셀레늄 경고',
  description: '12종 견과류 일일 권장 알 수·칼로리·영양소 + 혼합 직접 입력. 알레르기 필터와 셀레늄 자동 경고, 인기 믹스 6종.',
  keywords: ['견과류 적정량', '아몬드 하루', '호두 하루', '브라질너트 셀레늄', '견과류 혼합 계산', '견과류 알레르기', '다이어트 견과류', '견과류 칼로리', '셀레늄 과다', '하루 한 줌'],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  marginTop: '48px',
  letterSpacing: '-0.5px',
}
const card: React.CSSProperties = {
  background: 'var(--bg2)',
  border: '1px solid var(--border)',
  borderRadius: '14px',
  padding: '20px 22px',
  marginBottom: '14px',
}
const cell: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '1px solid var(--border)',
  fontSize: '13px',
  color: 'var(--text)',
  verticalAlign: 'top',
}
const headCell: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontWeight: 700,
  fontSize: '12px',
  color: 'var(--muted)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--bg3)',
}
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
  { "q":"견과류는 하루에 얼마나 먹어야 하나요?","a":"대부분의 견과류는 하루 28g(1온스, 한 줌)이 국제 영양 학회의 표준 1회 제공량입니다. 아몬드 약 23알, 호두 반쪽 14개, 피스타치오 약 49알. 하루 열량의 10~15%를 초과하지 않는 것이 좋으며, 2000kcal 기준 하루 약 160~200kcal(28g 내외)가 적절합니다." },
  { "q":"브라질너트는 왜 2~3알만 먹어야 하나요?","a":"브라질너트는 셀레늄 함량이 매우 높아 1알에만 약 68~137μg의 셀레늄이 들어있습니다. 성인 하루 셀레늄 상한 섭취량은 400μg인데 브라질너트 4~5알이면 이를 초과할 수 있습니다. 셀레늄 과잉 섭취 시 탈모, 손발톱 변형, 신경계 손상이 발생할 수 있어요. 본 도구의 셀레늄 자동 경고 활용." },
  { "q":"여러 견과류를 섞어 먹는 게 더 좋나요?","a":"네, 일반적으로 권장됩니다. 영양소 다양성 ↑ (각 견과류 강점 다름), 단조로움 ↓ (꾸준한 섭취), 셀레늄·오메가3·비타민E 균형. 본 도구의 인기 믹스 6종 프리셋(다이어트·근육·뇌 건강·심혈관·균형·트레일) 한 번 클릭으로 적용. 알레르기 그룹 자동 필터." },
  { "q":"견과류를 먹으면 살이 찌나요?","a":"견과류는 칼로리가 높지만(28g당 150~200kcal) 연구에 따르면 오히려 체중 관리에 도움이 됩니다. 포화지방 대신 불포화지방이 많고 식이섬유와 단백질이 포만감을 높여 전체 식사량을 줄이는 효과. 단, 대량 섭취는 칼로리 과잉으로 이어질 수 있으니 적정량 준수." },
  { "q":"견과류 알레르기는 어떻게 구분하나요?","a":"크게 세 그룹: 핵과류(아몬드·캐슈넛·피스타치오·호두·피칸·헤이즐넛·마카다미아·브라질너트·잣) → 서로 교차 반응, 콩과(땅콩) → 별도 그룹, 씨앗류(해바라기·호박씨) → 또 다른 그룹. 본 도구의 알레르기 필터 활용 — 그룹 체크 시 해당 견과류 자동 숨김." },
  { "q":"영유아·어린이는 견과류 언제부터 먹어도 되나요?","a":"일반 가이드(의사 상담 우선): 12개월 이전 X(질식·알레르기), 12~24개월 잘게 갈기·페이스트, 3세 이상 작은 알갱이, 5세 이하 통째 X(질식 위험). 가족력 있으면 의사 상담 후 도입, 첫 도입 시 소량부터, 응급 약(에피펜) 준비. 한국 영유아 알레르기 흔한 견과류는 땅콩·핵과류." },
  { "q":"신장·갑상선 환자도 견과류 먹어도 되나요?","a":"의사 상담 필수. 신장 질환: 인·칼륨 제한 필요. 견과류는 칼륨이 높아 의사 처방 식단 우선. 본 도구 결과 그대로 적용 X. 갑상선 질환: 셀레늄(브라질너트) 영향. 갑상선 호르몬 약 복용 시 의사 상담 필수, 일반인보다 엄격한 제한. 당뇨: 견과류 일반적 OK(혈당 안정). 단 가공된(꿀·초콜릿) 주의. 본 도구는 일반 가이드 — 기저 질환은 의사·영양사 상담 우선." },
  { "q":"견과류 알레르기 의심되면 어떻게 확인하나요?","a":"반드시 의료진 진단. 증상은 가벼움(입 가려움·두드러기) → 중간(부종·복통·구토) → 심함(호흡 곤란·아나필락시스). 🚨 아나필락시스(응급): 호흡 곤란·의식 저하·전신 두드러기 → 즉시 119 호출, 에피펜(있으면) 즉시 사용. 진단: 알레르기 전문의·소아과 → 피부 단자 시험·혈액 IgE 검사·경구 유발 시험(전문의 감독). 본 도구 결과로 자가 판단 X." },
  { "q":"가공 견과류(꿀·초콜릿·시즈닝) 먹어도 되나요?","a":"건강 효과 ↓ · 가끔 OK. 가염: 나트륨 +150mg/28g (고혈압 주의) 볶음: 항산화 일부 ↓·풍미 ↑ 오일 코팅: 지방 +10%·트랜스 우려 초콜릿: 설탕·트랜스지방·나트륨 +60% (간식 분류) 꿀 코팅: 당분 +20% (당뇨 주의) 평일 무염·생/건조, 주말 가벼운 가공 OK 정도가 적정. 본 도구의 가공 상태 토글로 칼로리·나트륨 자동 보정." },
  { "q":"어떤 견과류가 가장 건강에 좋나요?","a":"목적에 따라 다릅니다. 심혈관에는 오메가3가 풍부한 호두, 항산화에는 비타민E가 많은 아몬드·해바라기씨, 단백질에는 땅콩, 면역·갑상선에는 브라질너트(소량). 특정 견과류에 집중하기보다 혼합 견과류를 다양하게 섭취하는 것이 영양소 균형 면에서 가장 좋습니다 — 본 도구의 균형 믹스 프리셋 추천." }
]

export default function NutsPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>요리·식품</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="cooking" />견과류 섭취량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        12종 견과류 일일 권장 알 수·칼로리·영양소. 알레르기 필터와 <strong style={{ color: 'var(--text)' }}>셀레늄 자동 경고</strong>.
      </p>

      <NutsClient />

      <GuideDivider />

      {/* 1. 빠른 참조표 */}
      <h2 style={sectionTitle}>12종 견과류 빠른 참조표</h2>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: 420 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>견과류</th>
              <th scope="col" style={headCell}>1회</th>
              <th scope="col" style={headCell}>알 수</th>
              <th scope="col" style={headCell}>칼로리</th>
              <th scope="col" style={headCell}>핵심 영양소</th>
            </tr>
          </thead>
          <tbody>
            {[
              { n: '아몬드',       s: '28g', c: '약 23알',    k: '164kcal', v: '비타민E' },
              { n: '호두',         s: '28g', c: '반쪽 14개',  k: '185kcal', v: '오메가3' },
              { n: '캐슈넛',       s: '28g', c: '약 18알',    k: '157kcal', v: '마그네슘' },
              { n: '브라질너트',   s: '10g', c: '2~3알',      k: '66kcal',  v: '셀레늄' },
              { n: '땅콩',         s: '28g', c: '약 28알',    k: '161kcal', v: '단백질' },
              { n: '해바라기씨',   s: '28g', c: '—',          k: '165kcal', v: '비타민E' },
              { n: '호박씨',       s: '28g', c: '—',          k: '151kcal', v: '아연' },
              { n: '피스타치오',   s: '28g', c: '약 49알',    k: '159kcal', v: '비타민B6' },
              { n: '피칸',         s: '28g', c: '약 19알',    k: '196kcal', v: '망간' },
              { n: '마카다미아',   s: '28g', c: '약 10알',    k: '204kcal', v: '단일불포화' },
              { n: '헤이즐넛',     s: '28g', c: '약 21알',    k: '178kcal', v: '비타민E' },
              { n: '잣',           s: '28g', c: '—',          k: '191kcal', v: '철분' },
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ ...cell, fontWeight: 500 }}>{r.n}</td>
                <td style={{ ...cell, color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.s}</td>
                <td style={{ ...cell, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{r.c}</td>
                <td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.k}</td>
                <td style={cell}>{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        출처: 영양 성분 <a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>USDA FoodData Central</a>, 1회 제공량·권장 섭취 기준 <a href="https://www.kns.or.kr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>한국영양학회</a>(한국인 영양소 섭취기준). 값은 품종·가공·브랜드에 따라 달라지는 평균치입니다.
      </p>

      {/* 2. 브라질너트 셀레늄 */}
      <h2 style={sectionTitle}>🚨 브라질너트 셀레늄 주의</h2>
      <div style={{ background: 'rgba(255,50,50,0.06)', border: '2px solid rgba(255,80,80,0.4)', borderRadius: '12px', padding: '16px 20px', marginBottom: '14px' }}>
        <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 700, marginBottom: '8px' }}>
          브라질너트 1알 = 셀레늄 약 68~137μg
        </p>
        <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
          <li>성인 하루 셀레늄 권장량(RDA): <strong>55μg</strong></li>
          <li>상한 섭취량(UL): <strong>400μg</strong> — 이 이상 독성</li>
          <li>브라질너트 <strong>2~3알</strong>이면 이미 일일 권장량 초과</li>
          <li>브라질너트 <strong>4~5알</strong> 이상 매일 섭취 시 상한선 접근</li>
        </ul>
      </div>
      <div style={card}>
        <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>셀레늄 과잉 섭취 증상 (Selenosis)</p>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          탈모 · 손발톱 변형·탈락 · 구토·설사 · 신경계 손상 · 마늘 냄새 호흡 · 피로감
        </p>
        <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '8px' }}>
          ⚠️ 본 도구는 합산 셀레늄을 자동 계산해 RDA·UL 대비 표시합니다. 견과류 혼합팩 구매 시 브라질너트 비율 반드시 확인.
        </p>
      </div>

      {/* 3. 견과류 혼합 가이드 (NEW) */}
      <h2 style={sectionTitle}>견과류 혼합 가이드 — 인기 믹스 6종</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        본 도구의 <strong style={{ color: 'var(--text)' }}>인기 믹스 프리셋</strong>은 한 번의 클릭으로 적용됩니다. 각 믹스는 한국 사용자 식습관과 한국영양학회 권장 비율 참고.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>믹스</th>
              <th scope="col" style={headCell}>구성</th>
              <th scope="col" style={headCell}>총량</th>
              <th scope="col" style={headCell}>특징</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>다이어트</strong></td><td style={cell}>아몬드 12g + 피스타치오 12g</td><td style={cell}>24g</td><td style={cell}>저칼로리·고섬유·포만감</td></tr>
            <tr><td style={cell}><strong>근육</strong></td><td style={cell}>땅콩 14g + 호박씨 10g + 아몬드 10g</td><td style={cell}>34g</td><td style={cell}>고단백·운동 후 회복</td></tr>
            <tr><td style={cell}><strong>뇌 건강</strong></td><td style={cell}>호두 14g + 아몬드 14g</td><td style={cell}>28g</td><td style={cell}>오메가3·비타민E</td></tr>
            <tr><td style={cell}><strong>심혈관</strong></td><td style={cell}>호두 10g + 아몬드 10g + 피칸 8g</td><td style={cell}>28g</td><td style={cell}>불포화지방·항염증</td></tr>
            <tr><td style={cell}><strong>균형</strong></td><td style={cell}>아몬드·호두·캐슈넛·호박씨 각 6~8g</td><td style={cell}>30g</td><td style={cell}>종합 영양</td></tr>
            <tr><td style={cell}><strong>트레일</strong></td><td style={cell}>아몬드 12g + 캐슈넛 10g + 호박씨 8g</td><td style={cell}>30g</td><td style={cell}>등산·러닝 행동식</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        본 도구의 알레르기 필터를 켜면 해당 그룹 견과류가 포함된 믹스는 자동 비활성화됩니다.
      </p>

      {/* 4. 알레르기 그룹 가이드 (NEW) */}
      <h2 style={sectionTitle}>🛡️ 알레르기 그룹 가이드</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        견과류 알레르기는 그룹별로 교차 반응이 발생할 수 있습니다. 본 도구의 알레르기 필터로 해당 그룹 전체를 한 번에 제외 가능.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {[
          { group: '핵과류 (Tree nuts)', color: '#EA580C', list: '아몬드 · 캐슈넛 · 피스타치오 · 호두 · 피칸 · 헤이즐넛 · 마카다미아 · 브라질너트 · 잣', note: '하나에 알레르기가 있으면 다른 핵과류도 주의 (교차 반응 흔함)' },
          { group: '콩과 (Legume)', color: '#0891B2', list: '땅콩', note: '식물학적으로 견과류 X — 별도 알레르기 그룹. 한국 영유아 알레르기 흔함.' },
          { group: '씨앗류 (Seeds)', color: '#0EA5E9', list: '해바라기씨 · 호박씨', note: '핵과류 알레르기와 별개. 단, 가공 시 교차 오염 가능.' },
        ].map((g, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${g.color}44`, borderRadius: '12px', padding: '14px 16px' }}>
            <p style={{ fontSize: '13px', color: g.color, fontWeight: 700, marginBottom: '6px' }}>{g.group}</p>
            <p style={{ fontSize: '13px', color: 'var(--text)', fontWeight: 600, marginBottom: '6px', lineHeight: 1.6 }}>{g.list}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{g.note}</p>
          </div>
        ))}
      </div>
      <div style={{ ...card, marginTop: 14, background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.3)' }}>
        <p style={{ fontSize: '13px', color: '#DC2626', fontWeight: 700, marginBottom: '6px' }}>🚨 아나필락시스 (응급)</p>
        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, margin: 0 }}>
          호흡 곤란 · 의식 저하 · 전신 두드러기 → 즉시 <strong style={{ color: '#DC2626' }}>119 호출</strong>, 에피펜(있으면) 즉시 사용. 본 도구는 진단 X — 의심 시 알레르기 전문의 진료.
        </p>
      </div>

      {/* 5. 영유아·임산부·환자 가이드 (NEW) */}
      <h2 style={sectionTitle}>👶 영유아·임산부·환자 가이드</h2>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 440 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>대상</th>
              <th scope="col" style={headCell}>주의사항</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}><strong>12개월 미만</strong></td><td style={cell}>견과류 X (질식·알레르기 위험)</td></tr>
            <tr><td style={cell}><strong>12~24개월</strong></td><td style={cell}>잘게 갈거나 페이스트 형태로만</td></tr>
            <tr><td style={cell}><strong>3세 이상</strong></td><td style={cell}>작은 알갱이 가능. 5세 이하 통째 X (질식 위험).</td></tr>
            <tr><td style={cell}><strong>가족력 있는 영유아</strong></td><td style={cell}>의사 상담 후 도입. 첫 도입 시 소량부터, 응급 약(에피펜) 처방 가능.</td></tr>
            <tr><td style={cell}><strong>임산부</strong></td><td style={cell}>일반적 OK (혈관 건강·DHA). 단 가족력 있으면 의사 상담.</td></tr>
            <tr><td style={cell}><strong>신장 질환</strong></td><td style={cell}>인·칼륨 제한 필요. 견과류 ↑ 칼륨, 의사 처방 식단 우선.</td></tr>
            <tr><td style={cell}><strong>갑상선 질환</strong></td><td style={cell}>셀레늄(브라질너트) 영향. 호르몬 약 복용 시 의사 상담 필수.</td></tr>
            <tr><td style={cell}><strong>당뇨</strong></td><td style={cell}>견과류 일반적 OK (혈당 안정). 단 가공된(꿀·초콜릿) 주의.</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        ⚠️ 본 도구는 일반 가이드. 기저 질환·임신·영유아는 반드시 의사·영양사 상담 후. 응급 119 / 식약처 식품안전 1399 / 한국영양학회 (kns.or.kr).
      </p>

      {/* 6. 견과류 가성비 (NEW) */}
      <h2 style={sectionTitle}>견과류 가성비 (한국 마트 평균 참고)</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
        <strong style={{ color: 'var(--text)' }}>2026년 초</strong> 한국 대형 마트·온라인 평균 가격 기준 (참고용 · 실시간 가격 아님). 정확한 가격 비교는 <Link href="/tools/life/unit-price" style={{ color: 'var(--accent)' }}>단가 비교 계산기</Link>에서.
      </p>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>견과류</th>
              <th scope="col" style={headCell}>1g당 평균</th>
              <th scope="col" style={headCell}>1회분(28g) 단가</th>
              <th scope="col" style={headCell}>가성비</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={cell}>땅콩</td><td style={cell}>~12원</td><td style={cell}>~330원</td><td style={{ ...cell, color: '#059669' }}>★★★★★</td></tr>
            <tr><td style={cell}>해바라기씨</td><td style={cell}>~20원</td><td style={cell}>~560원</td><td style={{ ...cell, color: '#059669' }}>★★★★</td></tr>
            <tr><td style={cell}>호박씨</td><td style={cell}>~30원</td><td style={cell}>~840원</td><td style={{ ...cell, color: '#0EA5E9' }}>★★★★</td></tr>
            <tr><td style={cell}>아몬드</td><td style={cell}>~50원</td><td style={cell}>~1,400원</td><td style={{ ...cell, color: '#0EA5E9' }}>★★★</td></tr>
            <tr><td style={cell}>호두</td><td style={cell}>~60원</td><td style={cell}>~1,680원</td><td style={{ ...cell, color: '#D97706' }}>★★★</td></tr>
            <tr><td style={cell}>캐슈넛</td><td style={cell}>~70원</td><td style={cell}>~1,960원</td><td style={{ ...cell, color: '#D97706' }}>★★★</td></tr>
            <tr><td style={cell}>브라질너트</td><td style={cell}>~90원</td><td style={cell}>~900원 (10g)</td><td style={{ ...cell, color: '#D97706' }}>★★ (소량만)</td></tr>
            <tr><td style={cell}>피스타치오</td><td style={cell}>~120원</td><td style={cell}>~3,360원</td><td style={{ ...cell, color: '#D97706' }}>★★</td></tr>
            <tr><td style={cell}>마카다미아</td><td style={cell}>~200원</td><td style={cell}>~5,600원</td><td style={{ ...cell, color: '#DC2626' }}>★</td></tr>
            <tr><td style={cell}>잣</td><td style={cell}>~250원</td><td style={cell}>~7,000원</td><td style={{ ...cell, color: '#DC2626' }}>★</td></tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
        ⚠️ 특정 브랜드 추천 X. 가격은 마트·시즌·구매 채널에 따라 변동 큼. 단백질 가성비는 땅콩·호박씨, 비타민E는 아몬드·해바라기씨가 우수.
      </p>

      {/* 7. 가공 상태 비교 */}
      <h2 style={sectionTitle}>무염 vs 가염 vs 가공 견과류</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { n: '무염 건조',     c: '#059669', d: '가장 건강. 원래 영양소 그대로 보존. 건강 목적이면 이 선택이 기본.' },
          { n: '가염',          c: '#0891B2', d: '나트륨 추가 (28g당 약 150mg). 고혈압·신장 질환 있으면 주의.' },
          { n: '볶음',          c: '#D97706', d: '일부 항산화 성분 감소, 칼로리 소폭 증가(+5%). 풍미는 향상.' },
          { n: '오일 코팅',     c: '#EA580C', d: '불필요한 지방 추가(+10%). 기름 종류에 따라 트랜스지방 우려.' },
          { n: '초콜릿·시즈닝', c: '#DC2626', d: '설탕·트랜스지방·나트륨 급증(+60%). 건강 효과 크게 감소 — 간식 분류.' },
          { n: '꿀 코팅',       c: '#D97706', d: '당분 추가(+20%). 혈당 상승 빠름, 당뇨 주의.' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.c}44`, borderLeft: `3px solid ${s.c}`, borderRadius: '10px', padding: '12px 16px' }}>
            <p style={{ fontSize: '13px', color: s.c, fontWeight: 700, marginBottom: '4px' }}>{s.n}</p>
            <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>{s.d}</p>
          </div>
        ))}
      </div>

      {/* 8. 보관법 */}
      <h2 style={sectionTitle}>📦 견과류 보관법 & 산패 주의</h2>
      <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '14px' }}>
        견과류는 <strong style={{ color: 'var(--text)' }}>불포화지방산이 풍부해 산패되기 쉽습니다</strong>. 냄새가 이상하거나 쓴맛이 나면 산패 신호이므로 즉시 폐기하세요.
      </p>
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th scope="col" style={headCell}>보관 방법</th>
              <th scope="col" style={headCell}>장소</th>
              <th scope="col" style={headCell}>기간</th>
            </tr>
          </thead>
          <tbody>
            {[
              { m: '밀폐 용기, 실온', p: '서늘하고 어두운 곳', t: '1~2개월' },
              { m: '밀폐 용기, 냉장', p: '4°C 이하',            t: '1~3개월' },
              { m: '밀폐 용기, 냉동', p: '−18°C 이하',          t: '최대 1년' },
              { m: '껍질 있는 통째',  p: '서늘한 곳',            t: '6개월 이상' },
            ].map((r, i) => (
              <tr key={i}>
                <td style={cell}>{r.m}</td>
                <td style={{ ...cell, color: 'var(--muted)' }}>{r.p}</td>
                <td style={{ ...cell, color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{r.t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '10px' }}>
        💡 분쇄한 견과류는 통째보다 산패가 3~5배 빠릅니다. 필요할 때만 갈아서 사용.
      </p>

      {/* 9. FAQ — accordion */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 견과류는 하루에 얼마나 먹어야 하나요?</summary>
        <div style={faqAnswer}>
          대부분의 견과류는 <strong style={{ color: 'var(--text)' }}>하루 28g(1온스, 한 줌)</strong>이 국제 영양 학회의 표준 1회 제공량입니다. 아몬드 약 23알, 호두 반쪽 14개, 피스타치오 약 49알. 하루 열량의 10~15%를 초과하지 않는 것이 좋으며, 2000kcal 기준 하루 약 160~200kcal(28g 내외)가 적절합니다.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 브라질너트는 왜 2~3알만 먹어야 하나요?</summary>
        <div style={faqAnswer}>
          브라질너트는 셀레늄 함량이 매우 높아 <strong style={{ color: 'var(--text)' }}>1알에만 약 68~137μg</strong>의 셀레늄이 들어있습니다. 성인 하루 셀레늄 상한 섭취량은 400μg인데 브라질너트 4~5알이면 이를 초과할 수 있습니다. 셀레늄 과잉 섭취 시 탈모, 손발톱 변형, 신경계 손상이 발생할 수 있어요. 본 도구의 셀레늄 자동 경고 활용.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 여러 견과류를 섞어 먹는 게 더 좋나요?</summary>
        <div style={faqAnswer}>
          네, 일반적으로 권장됩니다. 영양소 다양성 ↑ (각 견과류 강점 다름), 단조로움 ↓ (꾸준한 섭취), 셀레늄·오메가3·비타민E 균형. 본 도구의 <strong style={{ color: 'var(--text)' }}>인기 믹스 6종 프리셋</strong>(다이어트·근육·뇌 건강·심혈관·균형·트레일) 한 번 클릭으로 적용. 알레르기 그룹 자동 필터.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 견과류를 먹으면 살이 찌나요?</summary>
        <div style={faqAnswer}>
          견과류는 칼로리가 높지만(28g당 150~200kcal) 연구에 따르면 오히려 체중 관리에 도움이 됩니다. 포화지방 대신 불포화지방이 많고 식이섬유와 단백질이 포만감을 높여 전체 식사량을 줄이는 효과. 단, 대량 섭취는 칼로리 과잉으로 이어질 수 있으니 적정량 준수.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 견과류 알레르기는 어떻게 구분하나요?</summary>
        <div style={faqAnswer}>
          크게 세 그룹: <strong style={{ color: 'var(--text)' }}>핵과류</strong>(아몬드·캐슈넛·피스타치오·호두·피칸·헤이즐넛·마카다미아·브라질너트·잣) → 서로 교차 반응, <strong style={{ color: 'var(--text)' }}>콩과</strong>(땅콩) → 별도 그룹, <strong style={{ color: 'var(--text)' }}>씨앗류</strong>(해바라기·호박씨) → 또 다른 그룹.
          본 도구의 알레르기 필터 활용 — 그룹 체크 시 해당 견과류 자동 숨김.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 영유아·어린이는 견과류 언제부터 먹어도 되나요?</summary>
        <div style={faqAnswer}>
          일반 가이드(의사 상담 우선): 12개월 이전 X(질식·알레르기), 12~24개월 잘게 갈기·페이스트, 3세 이상 작은 알갱이, 5세 이하 통째 X(질식 위험). 가족력 있으면 의사 상담 후 도입, 첫 도입 시 소량부터, 응급 약(에피펜) 준비. 한국 영유아 알레르기 흔한 견과류는 땅콩·핵과류.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 신장·갑상선 환자도 견과류 먹어도 되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>의사 상담 필수.</strong>
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li><strong>신장 질환</strong>: 인·칼륨 제한 필요. 견과류는 칼륨이 높아 의사 처방 식단 우선. 본 도구 결과 그대로 적용 X.</li>
            <li><strong>갑상선 질환</strong>: 셀레늄(브라질너트) 영향. 갑상선 호르몬 약 복용 시 의사 상담 필수, 일반인보다 엄격한 제한.</li>
            <li><strong>당뇨</strong>: 견과류 일반적 OK(혈당 안정). 단 가공된(꿀·초콜릿) 주의.</li>
          </ul>
          본 도구는 일반 가이드 — 기저 질환은 의사·영양사 상담 우선.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 견과류 알레르기 의심되면 어떻게 확인하나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>반드시 의료진 진단.</strong> 증상은 가벼움(입 가려움·두드러기) → 중간(부종·복통·구토) → 심함(호흡 곤란·아나필락시스).
          <br /><br />
          🚨 <strong style={{ color: '#DC2626' }}>아나필락시스(응급)</strong>: 호흡 곤란·의식 저하·전신 두드러기 → 즉시 119 호출, 에피펜(있으면) 즉시 사용.
          <br /><br />
          진단: 알레르기 전문의·소아과 → 피부 단자 시험·혈액 IgE 검사·경구 유발 시험(전문의 감독). 본 도구 결과로 자가 판단 X.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 가공 견과류(꿀·초콜릿·시즈닝) 먹어도 되나요?</summary>
        <div style={faqAnswer}>
          <strong style={{ color: 'var(--text)' }}>건강 효과 ↓ · 가끔 OK.</strong>
          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            <li>가염: 나트륨 +150mg/28g (고혈압 주의)</li>
            <li>볶음: 항산화 일부 ↓·풍미 ↑</li>
            <li>오일 코팅: 지방 +10%·트랜스 우려</li>
            <li>초콜릿: 설탕·트랜스지방·나트륨 +60% (간식 분류)</li>
            <li>꿀 코팅: 당분 +20% (당뇨 주의)</li>
          </ul>
          평일 무염·생/건조, 주말 가벼운 가공 OK 정도가 적정. 본 도구의 가공 상태 토글로 칼로리·나트륨 자동 보정.
        </div>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 어떤 견과류가 가장 건강에 좋나요?</summary>
        <div style={faqAnswer}>
          목적에 따라 다릅니다. 심혈관에는 오메가3가 풍부한 호두, 항산화에는 비타민E가 많은 아몬드·해바라기씨, 단백질에는 땅콩, 면역·갑상선에는 브라질너트(소량). 특정 견과류에 집중하기보다 <strong style={{ color: 'var(--text)' }}>혼합 견과류</strong>를 다양하게 섭취하는 것이 영양소 균형 면에서 가장 좋습니다 — 본 도구의 균형 믹스 프리셋 추천.
        </div>
      </details>

      {/* 10. 의료 면책 */}
      <h2 style={sectionTitle}>⚠️ 의료 면책</h2>
      <div style={{
        background: 'rgba(217, 119, 6, 0.06)',
        border: '1px solid rgba(217, 119, 6, 0.25)',
        borderRadius: '12px',
        padding: '18px 22px',
        fontSize: '14px',
        color: 'var(--text)',
        lineHeight: 1.8,
      }}>
        <ul style={{ paddingLeft: '20px', margin: 0 }}>
          <li>본 도구는 <strong>일반 영양 가이드</strong>입니다. 영양 정보는 평균값(<a href="https://fdc.nal.usda.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>USDA FoodData Central</a> · <a href="https://www.kns.or.kr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>한국영양학회</a> 섭취기준).</li>
          <li>알레르기·기저 질환(신장·갑상선)은 적정량이 다름 → 의사·영양사 상담.</li>
          <li>본 도구는 <strong>정확한 영양 진단·알레르기 진단·특정 브랜드 추천·의약품/보충제 비교</strong>를 제공하지 않습니다.</li>
          <li>도움 받기: <a href="https://www.kns.or.kr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>한국영양학회</a>, <a href="https://www.foodsafetykorea.go.kr/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>식약처 식품안전나라</a>(1399), 응급(아나필락시스) 119.</li>
        </ul>
      </div>

      {/* 11. 함께 쓰면 좋은 도구 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        <Link href="/tools/health/bmr" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔥</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>기초대사량(BMR)</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>하루 칼로리 목표</div>
        </Link>
        <Link href="/tools/health/weightloss" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎯</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>체중 감량 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>다이어트 기간</div>
        </Link>
        <Link href="/tools/health/bmi" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>⚖️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>BMI 계산기</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>체중 적정성</div>
        </Link>
        <Link href="/tools/health/supplement" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>💊</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>영양제 성분 체크</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>셀레늄 중복</div>
        </Link>
        <Link href="/tools/life/unit-price" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏷️</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>단가 비교</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>견과류 가성비</div>
        </Link>
        <Link href="/tools/cooking/substitute" style={{ ...card, display: 'block', textDecoration: 'none', marginBottom: 0 }}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🔄</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>식재료 대체 비율</div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>베이킹 견과</div>
        </Link>
      </div>
    </div>
  )
}
