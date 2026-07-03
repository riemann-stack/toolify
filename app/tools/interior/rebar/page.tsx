import Link from 'next/link'
import RebarClient from './RebarClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/interior/rebar',
  title: '철근 중량 계산기 — KS D 3504 D10~D51 + 트럭 적재 + 배근 가이드',
  description: 'KS D 3504 12규격(D10~D51) + 표준 길이별 본수·중량·톤·단가 + 트럭 적재 매칭과 옹벽·기초·계단 배근 가이드.',
  keywords: ['철근 중량', 'D10 무게', 'D13 1m', 'D16 6m', '철근 1톤', 'KS D 3504', 'SD400 SD500', '철근 단가', '트럭 적재', '옹벽 배근'],
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
  listStyle: 'none',
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
  { "q":"D10 1m는 몇 kg인가요?","a":"KS D 3504 표준 단위중량은 0.560 kg/m입니다. 6m 1본은 약 3.36kg, 12m 1본은 약 6.72kg. 제조사·롯트별 ±5% 오차가 있을 수 있으며, 표면 부식·녹 정도에 따라 실측 무게가 다소 변합니다." },
  { "q":"철근 1톤이면 D13 몇 본?","a":"D13의 단위중량은 0.995 kg/m이므로: • 6m 1본 = 5.97kg → 1톤 = 약 168본 • 12m 1본 = 11.94kg → 1톤 = 약 84본 중량→본수 탭에서 다른 규격도 즉시 매트릭스로 확인할 수 있어요." },
  { "q":"철근 절단 로스율은 보통 얼마?","a":"현장 일반 5~10%. 도면대로 정확히 시공하면 5%, 임의 절단이 잦거나 복잡한 형상이면 7~10%. 후크·갈고리·이음 길이가 많으면 더 높을 수 있습니다. 소량·DIY는 안전하게 10% 정도로 잡고 발주하세요." },
  { "q":"SD400과 SD500 차이는?","a":"SD 뒤 숫자는 항복강도(MPa). SD400은 400 MPa, SD500은 500 MPa로 25% 더 강합니다. 같은 강도가 필요한 부재라면 SD500은 더 가는 철근으로 대체 가능 — 무게·운반·시공이 줄어요. 가격은 SD500이 SD400보다 약 10% 비쌉니다. 한국 일반 건축물(공동주택·상가)은 SD400이 표준이며, 교량·고층·대형은 SD500/SD600." },
  { "q":"6m 철근과 12m 철근 어느 게 유리?","a":"현장 규모에 따라 다릅니다. • 6m — 1톤 트럭 운반 가능, 소형 현장·셀프 시공·자투리 활용에 좋음 • 12m — 이음(겹침) 횟수가 줄어 강도·시공성 우수, 자투리 적음. 단 5톤 카고 이상 차량 필요 → 운반비 ↑ 대형 현장이라면 12m가 종합적으로 유리한 경우가 많아요." },
  { "q":"결속선·스페이서는 얼마나 필요한가요?","a":"• 결속선(#18~#21): 건설공사 표준품셈상 철근 1톤당 약 5~8kg(간단한 구조 5·보통 6.5·복잡한 구조 8kg). 교차점마다 묶음 필요. • 콘크리트 스페이서: 1m²당 5~8개 (피복두께 유지용). 이 도구는 결속선을 철근 1톤당 약 6.5kg(≈0.65%)으로 자동 포함하는 옵션을 제공하며, 스페이서는 별도 발주가 일반적입니다." },
  { "q":"옹벽·기초·계단 셀프 배근 가능한가요?","a":"소형·비구조물에 한정해 가능합니다. • 가능: 담장·울타리, 옹벽 1m 미만, 카포트 기초, 짧은 계단(5단 이하) • 불가: 주택 슬래브·지하실·옹벽 1.5m↑·차고 천장 — 구조기술사 도면 + 건설업 등록업체 필수 건축법 위반 시 시정명령·과태료, 사고 시 형사 책임이 있습니다. 배근 가이드 탭은 참고용이며 대형·구조 부재는 반드시 전문가에게 의뢰하세요." },
  { "q":"철근 가격 변동은 어떻게 확인?","a":"철근 가격은 국제 원자재 시세·환율·계절·정부 정책에 따라 매주 변동합니다. 참고처: • 한국철강협회 시세표 — 월별 평균 발표 • POSCO·현대제철·동국제강 공식 발표가 • 건설사·철근 도매상 견적 — 실제 발주가에 가장 가까움 일반 SD400 톤당 80~120만원 범위가 최근 평균치입니다 (2026년 상반기 기준, 한국철강협회 시세 참고 — 발주 시 재확인)." },
  { "q":"1톤 트럭에 D10 6m 몇 본 실릴까?","a":"D10 6m 1본 = 3.36kg. 1톤(1000kg) ÷ 3.36 ≈ 약 298본. 단, 1톤 트럭은 적재 길이 제약(6m가 한계, 살짝 돌출)도 있어 결박을 단단히 해야 합니다. 더 굵은 철근(D25)은 6m 1본 23.9kg → 1톤이면 약 42본만 실립니다." },
  { "q":"고철 매도 시 중량 산정은?","a":"고철 매입은 실측 중량(저울)이 우선입니다. 본 도구로 추정한 중량은 본수·길이가 정확할 때만 일치하며, 부식·녹·절단 변형이 있으면 ±10% 오차가 있을 수 있어요. 철근 고철 시세는 kg당 200~400원(2026년 상반기 기준, 변동 큼)으로, 1톤이면 약 25~50만원. 매입 업체별로 가격 차이가 크므로 2~3곳 견적을 받으세요." }
]

export default function RebarPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        주거·인테리어
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏗️ 철근 중량 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px' }}>
        KS D 3504 12규격 + 길이별 본수·중량·톤·단가 + <strong style={{ color: 'var(--text)' }}>트럭 적재 매칭</strong>.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="단위중량 KS D 3504 · 결속선 건설공사 표준품셈 기준 — 가격·고철 시세는 변동치(발주 시 재확인)"
        sources={[{ label: '한국철강협회', href: 'https://www.kosa.or.kr' }]}
      />

      <RebarClient />

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>철근 규격 선택</strong> — D10~D51 (1m당 중량 자동 표시)</li>
          <li><strong>길이·본수 입력</strong> — 표준 6/8/10/12/13.7m 또는 직접</li>
          <li><strong>절단 로스율</strong> + <strong>결속선 자동 포함</strong> 설정</li>
          <li><strong>결과 확인</strong> — 총 중량·발주 권장·예상 단가·1본 무게</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>중량→본수 탭</strong>에서 1톤·5톤 같은 목표 중량을
          넣으면 규격별 본수 매트릭스가 나와 견적·발주에 바로 활용할 수 있어요.
        </p>
      </div>

      {/* 2. KS D 3504 */}
      <h2 style={sectionTitle}>📜 KS D 3504 이형 철근 규격</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          한국 표준 KS D 3504는 콘크리트 보강용 이형 철근의 형상·치수·기계적 성질을 규정합니다.
          호칭의 D 뒤 숫자는 <strong>공칭 직경(mm)</strong>을 의미하며, 단위중량은 다음 공식으로 계산됩니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', lineHeight: 1.9 }}>
            단위중량 (kg/m) = 단면적(mm²) × <strong style={{ color: 'var(--accent)' }}>7.85</strong> ÷ 1000<br />
            <span style={{ fontFamily: 'Noto Sans KR, sans-serif', fontSize: 12, color: 'var(--muted)' }}>
              (강의 비중 7.85 g/cm³ 기준)
            </span>
          </p>
        </div>
        <ul style={{ paddingLeft: 18, margin: '12px 0 0', fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
          <li><strong style={{ color: 'var(--text)' }}>D10</strong> = 공칭 직경 9.53mm, 단면적 71.33mm², 0.560 kg/m</li>
          <li><strong style={{ color: 'var(--text)' }}>D25</strong> = 공칭 직경 25.4mm, 단면적 506.7mm², 3.980 kg/m</li>
          <li><strong>이형(異形)</strong>이라 부르는 이유는 표면에 마디(rib)가 있어 콘크리트와의 부착력을 높이기 때문</li>
          <li>표면이 매끈한 원형 철근(보통철근)은 별도 용도로만 사용</li>
        </ul>
      </div>

      {/* 3. 강도 등급 */}
      <h2 style={sectionTitle}>🏷️ SD300·SD400·SD500·SD600 강도 등급 차이</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          SD = Steel Deformed bar의 약자, 뒤 숫자는 <strong>항복강도(MPa)</strong>입니다.
          숫자가 클수록 더 강하고 비싸지만, 같은 부재라면 더 가는 굵기로도 충분합니다.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: 'SD300', d: '항복 300 MPa · 저층·소형', c: '#9B9B9B', p: '×0.95' },
            { t: 'SD400', d: '항복 400 MPa · 한국 일반 표준', c: '#0D9488', p: '×1.00' },
            { t: 'SD500', d: '항복 500 MPa · 대형·고층·교량', c: '#D97706', p: '×1.10' },
            { t: 'SD600', d: '항복 600 MPa · 초고층·내진·플랜트', c: '#DB2777', p: '×1.20' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 6px', lineHeight: 1.6 }}>{g.d}</p>
              <p style={{ fontSize: 11, color: 'var(--accent)', margin: 0, fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 600 }}>가격 보정 {g.p}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ 일반 주택·공동주택은 <strong>SD400</strong>이 표준이며, 도면에 명시된 등급으로 발주해야 합니다.
        </p>
      </div>

      {/* 4. 표준 길이 */}
      <h2 style={sectionTitle}>📏 철근 표준 길이 — 왜 6m·12m인가?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          한국 이형철근의 정척(표준 길이)은 <strong>6·7·8·9·10·11·12m</strong>(대표 정척 8m)이며,
          현장에서는 6·8·10·12m가 흔히 쓰입니다. <strong>13.7m</strong>는 수출·특수 주문용 장척입니다.
          길이가 결정되는 핵심 요인은 <strong>운반 차량</strong>과 <strong>현장 작업성</strong>이에요.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--muted)', lineHeight: 1.95 }}>
            <li><strong style={{ color: 'var(--text)' }}>6m</strong> — 1톤 트럭 적재 가능, 소형 현장·셀프 시공 표준</li>
            <li><strong style={{ color: 'var(--text)' }}>8m·10m</strong> — 2.5톤 이상, 중간 현장</li>
            <li><strong style={{ color: 'var(--text)' }}>12m</strong> — 5톤 카고 이상, 대형 현장 (자투리 적음·이음 줄음)</li>
            <li><strong style={{ color: 'var(--text)' }}>13.7m</strong> — 11톤 카고, 초대형·플랜트 (수출·특수 주문 장척)</li>
          </ul>
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          긴 철근일수록 <strong>이음(겹침) 횟수가 줄어 강도가 좋아지고</strong>,
          현장 가공·결속 시간도 줄어들어 인건비를 절약할 수 있어요. 다만 운반 비용이 올라갑니다.
        </p>
      </div>

      {/* 5. 운반 안전 */}
      <h2 style={sectionTitle}>🚚 운반·하역 안전 가이드</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '🚐 1톤 (포터)', d: '6m 철근 적재 OK, 적재함 위로 살짝 돌출 가능. 결박 필수.', c: 'var(--accent)' },
            { t: '🛻 5톤 카고', d: '12m 철근 표준 운반차. 적재 결박 강하게.', c: '#0891B2' },
            { t: '🚜 11톤', d: '13.7m·대형 현장. 크레인·지게차 하역 권장.', c: '#EA580C' },
            { t: '⚠️ 굵은 철근', d: 'D29 이상은 1m당 5kg 이상 — 인력 하역 위험, 크레인 권장.', c: '#DB2777' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. D10 1m는 몇 kg인가요?</summary>
        <p style={faqAnswer}>
          KS D 3504 표준 단위중량은 <strong>0.560 kg/m</strong>입니다. 6m 1본은 약 3.36kg,
          12m 1본은 약 6.72kg. 제조사·롯트별 ±5% 오차가 있을 수 있으며, 표면 부식·녹 정도에 따라
          실측 무게가 다소 변합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. 철근 1톤이면 D13 몇 본?</summary>
        <p style={faqAnswer}>
          D13의 단위중량은 <strong>0.995 kg/m</strong>이므로:<br />
          • 6m 1본 = 5.97kg → 1톤 = 약 <strong>168본</strong><br />
          • 12m 1본 = 11.94kg → 1톤 = 약 <strong>84본</strong><br />
          중량→본수 탭에서 다른 규격도 즉시 매트릭스로 확인할 수 있어요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. 철근 절단 로스율은 보통 얼마?</summary>
        <p style={faqAnswer}>
          현장 일반 <strong>5~10%</strong>. 도면대로 정확히 시공하면 5%, 임의 절단이 잦거나
          복잡한 형상이면 7~10%. 후크·갈고리·이음 길이가 많으면 더 높을 수 있습니다.
          소량·DIY는 안전하게 10% 정도로 잡고 발주하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. SD400과 SD500 차이는?</summary>
        <p style={faqAnswer}>
          SD 뒤 숫자는 <strong>항복강도(MPa)</strong>. SD400은 400 MPa, SD500은 500 MPa로 25% 더 강합니다.
          같은 강도가 필요한 부재라면 SD500은 더 가는 철근으로 대체 가능 — 무게·운반·시공이 줄어요.
          가격은 SD500이 SD400보다 약 10% 비쌉니다. 한국 일반 건축물(공동주택·상가)은 <strong>SD400</strong>이 표준이며,
          교량·고층·대형은 SD500/SD600.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. 6m 철근과 12m 철근 어느 게 유리?</summary>
        <p style={faqAnswer}>
          현장 규모에 따라 다릅니다.<br />
          • <strong>6m</strong> — 1톤 트럭 운반 가능, 소형 현장·셀프 시공·자투리 활용에 좋음<br />
          • <strong>12m</strong> — 이음(겹침) 횟수가 줄어 <strong>강도·시공성 우수</strong>, 자투리 적음.
          단 5톤 카고 이상 차량 필요 → 운반비 ↑<br />
          대형 현장이라면 12m가 종합적으로 유리한 경우가 많아요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. 결속선·스페이서는 얼마나 필요한가요?</summary>
        <p style={faqAnswer}>
          • <strong>결속선(#18~#21)</strong>: 건설공사 표준품셈상 <strong>철근 1톤당 약 5~8kg</strong>(간단 5·보통 6.5·복잡 8kg). 교차점마다 묶음 필요.<br />
          • <strong>콘크리트 스페이서</strong>: 1m²당 5~8개 (피복두께 유지용).
          이 도구는 결속선을 <strong>철근 1톤당 약 6.5kg(≈0.65%)</strong>으로 자동 포함하는 옵션을 제공하며, 스페이서는 별도 발주가 일반적입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 옹벽·기초·계단 셀프 배근 가능한가요?</summary>
        <p style={faqAnswer}>
          <strong>소형·비구조물에 한정해 가능</strong>합니다.<br />
          • 가능: 담장·울타리, 옹벽 1m 미만, 카포트 기초, 짧은 계단(5단 이하)<br />
          • 불가: 주택 슬래브·지하실·옹벽 1.5m↑·차고 천장 — <strong>구조기술사 도면 + 건설업 등록업체</strong> 필수<br />
          건축법 위반 시 시정명령·과태료, 사고 시 형사 책임이 있습니다. 배근 가이드 탭은 <strong>참고용</strong>이며
          대형·구조 부재는 반드시 전문가에게 의뢰하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 철근 가격 변동은 어떻게 확인?</summary>
        <p style={faqAnswer}>
          철근 가격은 <strong>국제 원자재 시세·환율·계절·정부 정책</strong>에 따라 매주 변동합니다.
          참고처:<br />
          • <strong>한국철강협회 시세표</strong> — 월별 평균 발표<br />
          • <strong>POSCO·현대제철·동국제강</strong> 공식 발표가<br />
          • <strong>건설사·철근 도매상</strong> 견적 — 실제 발주가에 가장 가까움<br />
          일반 SD400 톤당 80~120만원 범위가 최근 평균치입니다
          (2026년 상반기 기준, 한국철강협회 시세 참고 — 발주 시 재확인).
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 1톤 트럭에 D10 6m 몇 본 실릴까?</summary>
        <p style={faqAnswer}>
          D10 6m 1본 = 3.36kg. 1톤(1000kg) ÷ 3.36 ≈ <strong>약 298본</strong>.
          단, 1톤 트럭은 적재 길이 제약(6m가 한계, 살짝 돌출)도 있어 결박을 단단히 해야 합니다.
          더 굵은 철근(D25)은 6m 1본 23.9kg → 1톤이면 약 42본만 실립니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 고철 매도 시 중량 산정은?</summary>
        <p style={faqAnswer}>
          고철 매입은 <strong>실측 중량(저울)</strong>이 우선입니다. 본 도구로 추정한 중량은
          본수·길이가 정확할 때만 일치하며, 부식·녹·절단 변형이 있으면 ±10% 오차가 있을 수 있어요.
          철근 고철 시세는 <strong>kg당 200~400원</strong>(2026년 상반기 기준, 변동 큼)으로,
          1톤이면 <strong>약 25~50만원</strong>. 매입 업체별로 가격 차이가 크므로 2~3곳 견적을 받으세요.
        </p>
      </details>

      {/* 인테리어 도구 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Link href="/tools/interior/wire" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>⚡</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>전선 굵기·허용전류</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            KEC 2021 + 가전 12프리셋
          </p>
        </Link>
        <Link href="/tools/interior/pipe" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔧</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>배관 규격 변환기</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            A호칭·인치·DN + 6재질
          </p>
        </Link>
        <Link href="/tools/interior/bolt-wrench" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontSize: 22, margin: '0 0 4px' }}>🔧</p>
          <p style={{ fontSize: 14, color: 'var(--text)', fontWeight: 700, margin: '0 0 2px' }}>볼트·너트 스패너</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
            ISO/JIS · 알렌·와셔·토크
          </p>
        </Link>
      </div>
    </div>
  )
}
