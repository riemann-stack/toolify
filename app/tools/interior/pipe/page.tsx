import Link from 'next/link'
import PipeClient from './PipeClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from '@/components/ToolSection'
import FaqJsonLd from '@/components/FaqJsonLd'
import ToolIconBadge from '@/components/ToolIconBadge'

export const metadata = buildMetadata({
  path: '/tools/interior/pipe',
  title: '배관 규격 변환기 — A호칭·인치·DN 통합 + 6재질 외경/내경 비교',
  description: 'A호칭·인치·DN 통합 + 강관·PVC·PB·XL·동관·스테인리스 6재질 실제 OD/ID 비교 + 부속·연결법과 유량 계산.',
  keywords: ['배관 규격', '15A 몇 mm', 'A호칭 인치 변환', 'DN 호칭', '강관 외경', 'PVC VG1 VG2', 'PB XL 차이', '동관 K L M', '스테인리스 배관', '배관 유량 계산'],
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
  { "q":"15A는 몇 mm인가요?","a":"15A는 호칭 이름이며 실제 외경은 재질에 따라 다릅니다. 강관 21.7mm / PVC 22mm / PB 17mm / XL 17mm / 동관 15.88mm / STS 19.05mm. 내경(ID)은 두께 등급별로 또 다릅니다. 호칭이 같다고 해서 부속이 호환되지 않으니 주의하세요." },
  { "q":"A호칭과 인치는 어떻게 변환하나요?","a":"표준이 미리 짝지어 놓은 호칭입니다: 15A=1/2\", 20A=3/4\", 25A=1\", 50A=2\", 100A=4\". 어림수로 'A÷25 ≈ 인치'를 쓰기도 하지만 작은 사이즈(15A·20A)에서는 다소 어긋나므로(15A→0.6 vs 실제 1/2\"=0.5) 정확한 값은 위 변환표를 참고하세요." },
  { "q":"DN은 뭔가요?","a":"DN(Diametre Nominal)은 ISO·EN(유럽) 표준 호칭입니다. ISO 6708 기준이며 숫자는 mm 정수에 가깝습니다(DN15·DN20·DN25...). 한국 KS도 도면·시방에서 DN을 병기하는 경우가 많아요. 15A = 1/2\" = DN15 모두 같은 호칭입니다." },
  { "q":"백관과 흑관 차이가 뭔가요?","a":"모재는 같지만 아연도금 유무가 다릅니다. 백관(아연도금)은 부식에 강해 급수·소방·옥내 일반 배관에 사용하고, 흑관은 도금이 없어 가격이 싸지만 부식에 약해 난방·기름·증기 등 옥내 비부식 환경 또는 도장·코팅 후 사용합니다. 옥외 노출 백관 추천." },
  { "q":"PVC VG1과 VG2 차이는?","a":"두께·압력 등급이 다릅니다. VG1은 두꺼워서 1.0~1.6 MPa 압력에 견디고 음용수 급수에 사용합니다. VG2는 얇고 비압력용으로 배수·통기관·우수관에 씁니다. 내충격이 필요한 한랭지·노출 구간은 HI-VG(내충격)를 사용하세요." },
  { "q":"PB와 XL 어느 게 좋은가요?","a":"용도가 다릅니다. PB(폴리부틸렌)은 유연·내열·내압이 우수해 세대 내 급수·급탕·바닥난방 전반에 쓰이고, XL(PE-X 가교폴리에틸렌)은 특히 바닥난방·온수 분배기 표준입니다(한국 외경 17/20). PB는 그립링+슬리브 시공, XL은 황동 인서트·푸시핏 시공이 표준이며, 현장에서는 두 자재가 혼재해 사용됩니다. 시공 편의·가격·납기로 결정하면 됩니다." },
  { "q":"동관 K·L·M 차이는?","a":"두께(=내압)이 다릅니다. K Type이 가장 두껍고(의료용 가스·고압), L Type이 중간(가정용 가스·급수 표준), M Type이 가장 얇습니다(저압·일반 냉난방). 외경(OD)은 모두 같지만 내경이 달라집니다. 가정용 도시가스·LPG는 보통 L Type이며, 자세한 사양은 도시가스사 시방서 우선." },
  { "q":"가스배관은 어느 자재를 쓰나요?","a":"국내 도시가스·LPG 배관은 강관(백관·STPG) 또는 동관(L Type)이 표준이며, 최근에는 PE 코팅 강관·황동관도 사용됩니다. 가스배관 시공은 가스시설시공업 등록 사업자·가스기능사 자격이 필수이며, 일반인의 자가시공은 도시가스사업법·고압가스안전관리법 위반입니다. 반드시 도시가스사 또는 등록 시공업체에 의뢰하세요." },
  { "q":"동파 방지 단열재 두께는 얼마나?","a":"일반적으로 15·20A=10mm, 25·32A=15mm, 40A=20mm, 50·65·80A=25mm, 100·125A=30mm, 150A=40mm가 권장입니다. 영하 10°C 이하 한랭지·옥외 노출 구간은 1.5~2배 두께를 추가하세요. 단열재는 아트론(폴리에틸렌 발포)이나 고무발포(아마플렉스 등)를 가장 많이 사용합니다. 중요한 것은 틈새·이음부 빈틈없이 감싸는 것이며, 동파 방지 열선과 병용하면 더 안전합니다." },
  { "q":"같은 15A인데 부속이 안 맞아요. 왜죠?","a":"호칭은 같아도 실제 외경(OD)이 재질별로 다르기 때문입니다. 예: 강관 15A 부속을 PB 15A에 끼우려고 해도 외경이 21.7mm vs 17mm로 약 4.7mm 차이가 나서 절대 맞지 않습니다. 이종 재질 연결이 필요하면 이종 어댑터·이종조인(예: PB-스틸 어댑터)을 사용하세요. 또한 같은 재질·같은 호칭이라도 브랜드별 부속 규격이 다른 경우가 있습니다(특히 PB — 한일파이프 vs 슈퍼파이프). 가능하면 같은 브랜드로 통일이 안전합니다." }
]

export default function PipePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        주거·인테리어
      </p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="interior" />배관 규격 변환기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px' }}>
        A호칭·인치·DN 통합 + <strong style={{ color: 'var(--text)' }}>강관·PVC·PB·XL·동관·STS</strong> 6재질 실제 OD/ID와 유량.
      </p>

      <PipeClient />

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 20, fontSize: 12, color: 'var(--muted)', lineHeight: 1.85 }}>
        <p style={{ margin: '0 0 6px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>📐 데이터 기준 · 참고 표준</p>
        표시 치수는 KS·ASME·ISO <strong style={{ color: 'var(--text)' }}>표준 일반치 참고용</strong>입니다 (최종 점검 2026.6).
        <br />· <strong style={{ color: 'var(--text)' }}>호칭 체계</strong>: A호칭 KS B 1503 · 인치(B) ASME B36.10 · DN ISO 6708
        <br />· <strong style={{ color: 'var(--text)' }}>재질·두께</strong>: 강관 KS D 3507·3562 / Sch ASME B36.10M · PVC KS M 3404 · PB KS M 3363 · XL KS M 3357 · 동관 KS D 5301 · STS 위생관 일반치
        <br />· 실제 제품의 외경·두께·압력 등급은 <strong style={{ color: 'var(--text)' }}>제조사 도면·시방서가 우선</strong>합니다. 특히 <strong>STS·프레스 시스템</strong>은 제품별 외경이 달라 도면 확인이 필수입니다.
      </div>

      <GuideDivider />

      {/* 1. 어떻게 사용하나요? */}
      <h2 style={sectionTitle}>🛠️ 어떻게 사용하나요?</h2>
      <div style={card}>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: 'var(--text)', lineHeight: 2 }}>
          <li><strong>재질 선택</strong> — 강관 / PVC / PB / XL / 동관 / 스테인리스</li>
          <li><strong>호칭 선택</strong> — 15A ~ 150A (인치·DN 동시 표시)</li>
          <li><strong>등급 토글</strong> — 백관/흑관, VG1/VG2, K/L/M Type 등</li>
          <li><strong>결과 확인</strong> — 외경·내경·두께 + 단열재·곡률 한 번에</li>
        </ol>
        <p style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          💡 <strong style={{ color: 'var(--accent)' }}>재질 비교 탭</strong>에서 같은 호칭(예: 15A)의
          6재질 외경 차이를 그래프로 확인할 수 있어요. <strong>왜 이종 재질 부속이 안 맞는지</strong>
          한눈에 보입니다.
        </p>
      </div>

      {/* 2. 호칭 차이 */}
      <h2 style={sectionTitle}>🌐 A호칭·인치·DN, 어떻게 다른가요?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          세 가지 모두 같은 사이즈를 부르는 다른 이름입니다. <strong>실제 외경이 아니라 분류 이름</strong>이에요.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 12 }}>
          {[
            { t: 'A호칭 (한국·일본)', s: 'KS B 1503', d: '15A · 20A · 25A · 50A — mm 베이스 정수', c: 'var(--accent)' },
            { t: 'B호칭 / 인치 (미국)', s: 'ASME B36.10', d: '1/2" · 3/4" · 1" · 2" — 분수 형태', c: '#0891B2' },
            { t: 'DN (유럽·국제)', s: 'ISO 6708', d: 'DN15 · DN20 · DN25 · DN50 — Diametre Nominal', c: '#EA580C' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '12px 14px' }}>
              <p style={{ fontSize: 13, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 6px', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{g.s}</p>
              <p style={{ fontSize: 12, color: 'var(--text)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, background: 'var(--bg3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.8 }}>
          💡 <strong style={{ color: 'var(--text)' }}>외워두기</strong>: 15A = 1/2&quot; = DN15 (모두 같은 호칭)
        </div>
      </div>

      {/* 3. 같은 호칭, 다른 외경 */}
      <h2 style={sectionTitle}>📐 같은 호칭인데 외경이 왜 다른가요?</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          호칭은 <strong>&quot;그 정도 사이즈&quot;를 묶은 분류 이름</strong>일 뿐이며,
          실제 외경(OD)은 재질별 표준에 따라 모두 다릅니다.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 8px' }}>15A 재질별 외경 차이</p>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ padding: '4px 0' }}>강관 (SGP)</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>21.7 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>PVC (VG1)</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>22.0 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>PB</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>17.0 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>XL (PE-X)</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>17.0 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>동관 (L)</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>15.88 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>STS (Su)</td><td style={{ color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', textAlign: 'right' }}>19.05 mm</td></tr>
            </tbody>
          </table>
          <p style={{ fontSize: 12, color: '#D97706', margin: '10px 0 0', lineHeight: 1.7 }}>
            → 같은 15A지만 외경이 <strong>15.88 ~ 22mm</strong> (약 6mm 차이).
            이종 재질 연결에는 <strong>이종 어댑터·이종조인</strong>이 필수입니다.
          </p>
        </div>
      </div>

      {/* 4. 등급 의미 */}
      <h2 style={sectionTitle}>🏷️ 백관·흑관·VG1·VG2·K/L/M 등급 의미</h2>
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {[
            { t: '🔩 강관 백관 (SGP)', d: '아연도금 처리. 부식 강함. 급수·소방·옥내 일반.', c: 'var(--accent)' },
            { t: '🔩 강관 흑관 (SGP)', d: '도금 없음. 난방·기름·증기·공정. 옥외 노출 비추천.', c: '#EA580C' },
            { t: '🔵 PVC VG1', d: '수도용 두꺼움. 1.0~1.6 MPa. 음용수 가능.', c: '#0891B2' },
            { t: '🔵 PVC VG2', d: '배수용 얇음. 비압력. 통기·우수·하수.', c: '#0D9488' },
            { t: '🔵 PVC HI-VG', d: 'VG1 + 내충격. 한랭지·노출 배관.', c: '#9B59B6' },
            { t: '🟤 동관 K Type', d: '가장 두꺼움. 의료용 가스·고압.', c: '#D97706' },
            { t: '🟤 동관 L Type', d: '중간. 가정용 가스·급수 표준.', c: '#DB2777' },
            { t: '🟤 동관 M Type', d: '가장 얇음. 저압·일반 냉난방.', c: '#059669' },
          ].map((g, i) => (
            <div key={i} style={{ background: 'var(--bg3)', borderTop: `3px solid ${g.c}`, borderRadius: 10, padding: '10px 14px' }}>
              <p style={{ fontSize: 12, color: g.c, fontWeight: 700, margin: '0 0 4px' }}>{g.t}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, lineHeight: 1.7 }}>{g.d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 단열재 두께 */}
      <h2 style={sectionTitle}>🧊 단열재 두께·동파 방지 가이드</h2>
      <div style={card}>
        <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.85, marginTop: 0 }}>
          외부 노출·옥상·세탁실·발코니의 배관은 동파·결로 방지를 위해 단열재(아트론·고무발포 등)를 감습니다.
          <strong>관 굵기가 클수록 두꺼운 단열재</strong>가 필요해요.
        </p>
        <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginTop: 12 }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th scope="col" style={{ textAlign: 'left', padding: '6px 0', color: 'var(--muted)', fontSize: 11 }}>호칭</th>
                <th scope="col" style={{ textAlign: 'right', padding: '6px 0', color: 'var(--muted)', fontSize: 11 }}>권장 단열재 두께</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '4px 0' }}>15A · 20A</td><td style={{ textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--accent)' }}>10 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>25A · 32A</td><td style={{ textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--accent)' }}>15 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>40A</td><td style={{ textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--accent)' }}>20 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>50A · 65A · 80A</td><td style={{ textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--accent)' }}>25 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>100A · 125A</td><td style={{ textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--accent)' }}>30 mm</td></tr>
              <tr><td style={{ padding: '4px 0' }}>150A 이상</td><td style={{ textAlign: 'right', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', color: 'var(--accent)' }}>40 mm 이상</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>
          ※ 영하 10°C 이하 한랭지·옥외 노출 구간은 1.5~2배 두께 권장.
          아트론(폴리에틸렌 발포) 또는 고무발포(아마플렉스) 자재를 가장 흔히 사용합니다.
        </p>
      </div>

      {/* FAQ */}
      <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
      <FaqJsonLd items={FAQ_LD} />

      <details style={faqDetails}>
        <summary style={faqSummary}>Q1. 15A는 몇 mm인가요?</summary>
        <p style={faqAnswer}>
          15A는 <strong>호칭 이름</strong>이며 실제 외경은 재질에 따라 다릅니다.
          강관 21.7mm / PVC 22mm / PB 17mm / XL 17mm / 동관 15.88mm / STS 19.05mm.
          내경(ID)은 두께 등급별로 또 다릅니다. 호칭이 같다고 해서 부속이 호환되지 않으니 주의하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q2. A호칭과 인치는 어떻게 변환하나요?</summary>
        <p style={faqAnswer}>
          표준이 미리 <strong>짝지어 놓은 호칭</strong>입니다: 15A=1/2&quot;, 20A=3/4&quot;, 25A=1&quot;, 50A=2&quot;, 100A=4&quot;.
          어림수로 <strong>&apos;A÷25 ≈ 인치&apos;</strong>를 쓰기도 하지만 작은 사이즈(15A·20A)에서는 다소 어긋나므로
          (15A→0.6 vs 실제 1/2&quot;=0.5) 정확한 값은 위 변환표를 참고하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q3. DN은 뭔가요?</summary>
        <p style={faqAnswer}>
          DN(Diametre Nominal)은 <strong>ISO·EN(유럽) 표준 호칭</strong>입니다. ISO 6708 기준이며
          숫자는 mm 정수에 가깝습니다(DN15·DN20·DN25...). 한국 KS도 도면·시방에서 DN을 병기하는 경우가
          많아요. 15A = 1/2&quot; = DN15 모두 같은 호칭입니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q4. 백관과 흑관 차이가 뭔가요?</summary>
        <p style={faqAnswer}>
          모재는 같지만 <strong>아연도금 유무</strong>가 다릅니다.
          <strong>백관(아연도금)</strong>은 부식에 강해 급수·소방·옥내 일반 배관에 사용하고,
          <strong>흑관</strong>은 도금이 없어 가격이 싸지만 부식에 약해 난방·기름·증기 등 옥내 비부식 환경
          또는 도장·코팅 후 사용합니다. 옥외 노출 백관 추천.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q5. PVC VG1과 VG2 차이는?</summary>
        <p style={faqAnswer}>
          <strong>두께·압력 등급</strong>이 다릅니다.
          <strong>VG1</strong>은 두꺼워서 1.0~1.6 MPa 압력에 견디고 음용수 급수에 사용합니다.
          <strong>VG2</strong>는 얇고 비압력용으로 배수·통기관·우수관에 씁니다.
          내충격이 필요한 한랭지·노출 구간은 <strong>HI-VG</strong>(내충격)를 사용하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q6. PB와 XL 어느 게 좋은가요?</summary>
        <p style={faqAnswer}>
          용도가 다릅니다. <strong>PB(폴리부틸렌)</strong>은 유연·내열·내압이 우수해 세대 내 급수·급탕·바닥난방
          전반에 쓰이고, <strong>XL(PE-X 가교폴리에틸렌)</strong>은 특히 바닥난방·온수 분배기 표준입니다(한국
          외경 17/20). PB는 그립링+슬리브 시공, XL은 황동 인서트·푸시핏 시공이 표준이며,
          현장에서는 두 자재가 혼재해 사용됩니다. 시공 편의·가격·납기로 결정하면 됩니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q7. 동관 K·L·M 차이는?</summary>
        <p style={faqAnswer}>
          <strong>두께(=내압)</strong>이 다릅니다.
          K Type이 가장 두껍고(의료용 가스·고압), L Type이 중간(가정용 가스·급수 표준),
          M Type이 가장 얇습니다(저압·일반 냉난방). 외경(OD)은 모두 같지만 내경이 달라집니다.
          가정용 도시가스·LPG는 보통 L Type이며, 자세한 사양은 도시가스사 시방서 우선.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q8. 가스배관은 어느 자재를 쓰나요?</summary>
        <p style={faqAnswer}>
          국내 도시가스·LPG 배관은 <strong>강관(백관·STPG) 또는 동관(L Type)</strong>이 표준이며,
          최근에는 PE 코팅 강관·황동관도 사용됩니다.
          <strong>가스배관 시공은 가스시설시공업 등록 사업자·가스기능사 자격이 필수</strong>이며,
          <strong>일반인의 자가시공은 도시가스사업법·고압가스안전관리법 위반</strong>입니다.
          반드시 도시가스사 또는 등록 시공업체에 의뢰하세요.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q9. 동파 방지 단열재 두께는 얼마나?</summary>
        <p style={faqAnswer}>
          일반적으로 <strong>15·20A=10mm, 25·32A=15mm, 40A=20mm, 50·65·80A=25mm, 100·125A=30mm, 150A=40mm</strong>가 권장입니다.
          영하 10°C 이하 한랭지·옥외 노출 구간은 1.5~2배 두께를 추가하세요. 단열재는 <strong>아트론(폴리에틸렌
          발포)</strong>이나 <strong>고무발포(아마플렉스 등)</strong>를 가장 많이 사용합니다.
          중요한 것은 <strong>틈새·이음부 빈틈없이 감싸는 것</strong>이며, 동파 방지 열선과 병용하면 더 안전합니다.
        </p>
      </details>

      <details style={faqDetails}>
        <summary style={faqSummary}>Q10. 같은 15A인데 부속이 안 맞아요. 왜죠?</summary>
        <p style={faqAnswer}>
          호칭은 같아도 <strong>실제 외경(OD)이 재질별로 다르기 때문</strong>입니다. 예: 강관 15A 부속을
          PB 15A에 끼우려고 해도 외경이 21.7mm vs 17mm로 약 4.7mm 차이가 나서 절대 맞지 않습니다.
          이종 재질 연결이 필요하면 <strong>이종 어댑터·이종조인(예: PB-스틸 어댑터)</strong>을 사용하세요.
          또한 같은 재질·같은 호칭이라도 <strong>브랜드별 부속 규격이 다른 경우</strong>가 있습니다(특히 PB —
          한일파이프 vs 슈퍼파이프). 가능하면 <strong>같은 브랜드로 통일</strong>이 안전합니다.
        </p>
      </details>

      {/* 인테리어 도구 크로스링크 */}
      <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {[
          { href: '/tools/interior/screw', icon: '🔩', name: '나사 규격 계산기', desc: 'PT 나사·관통홀·인치↔mm' },
          { href: '/tools/interior/bolt-wrench', icon: '🔧', name: '볼트·너트 스패너 사이즈', desc: 'ISO/JIS · 알렌·와셔·토크' },
          { href: '/tools/interior/molding', icon: '📏', name: '몰딩 계산기', desc: '천장·걸레받이·문틀 둘레' },
          { href: '/tools/interior/wire', icon: '⚡', name: '전선 굵기 계산기', desc: '허용전류·차단기·전압강하' },
        ].map((t) => (
          <Link key={t.href} href={t.href} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '14px 16px', textDecoration: 'none',
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
