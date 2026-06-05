import Link from 'next/link'
import FreelanceTaxClient from './FreelanceTaxClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'

export const metadata = buildMetadata({
  path: '/tools/finance/freelance-tax',
  title: '프리랜서 종합소득세 계산기 — 단순경비율 자동 + 공제 시뮬 + 시나리오 비교 (2026년)',
  description:
    '업종별 단순경비율 자동(30+ 직군) + 8단계 누진세율과 노란우산·연금저축 절세 시나리오 5종 비교. 2026년 5월 신고 D-day.',
  keywords: [
    '프리랜서 종합소득세', '종소세 계산기', '종합소득세 환급',
    '3.3 원천징수', '프리랜서 세금', '프리랜서 환급',
    '단순경비율', '기준경비율', '경비처리', '필요경비',
    '노란우산공제', '연금저축 세액공제', 'IRP',
    '종합소득세율', '누진세율', '한계세율', '실효세율',
    '5월 종소세 신고', '홈택스 종소세', '모두채움 신고',
    'IT개발자 종소세', '디자이너 종소세', '유튜버 종소세',
    '강사 종소세', '학원강사 종소세', '번역가 종소세',
    '소득공제', '세액공제', '인적공제',
    '복식부기 의무', '간편장부', '장부작성',
    '지방소득세', '가산세', '무신고 가산세',
    '부업 프리랜서', '직장인 부업 종소세', '겸업 신고',
    '2026년 종합소득세', '프리랜서 절세',
  ],
})

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '22px',
  fontWeight: 700,
  marginBottom: '14px',
  letterSpacing: '-0.01em',
}
const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}
const dedTitle: React.CSSProperties = { fontSize: '14px', fontWeight: 700, marginBottom: '8px' }
const dedTable: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '13px' }
const dedTh: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }
const faqDetails: React.CSSProperties = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', marginBottom: '8px' }
const faqSummary: React.CSSProperties = { cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }
const faqAnswerAcc: React.CSSProperties = { marginTop: '10px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85 }
const relCard: React.CSSProperties = { display: 'block', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', textDecoration: 'none' }

const FAQ_LD = [
  { q: '3.3% 원천징수만 내면 되는 거 아닌가요?', a: '아닙니다. 3.3%(소득세 3% + 지방소득세 0.3%)는 <strong style="color:var(--text)">임시로 미리 낸 세금</strong>일 뿐, 진짜 세금은 매년 5월 종합소득세 신고로 정산합니다. 본인의 실제 세율(6~45% 누진)에 따라 더 받거나 더 내야 합니다. 매출이 적고 경비·공제가 충분하면 <strong style="color:#059669">환급</strong>, 매출이 크고 한계세율 24% 이상이면 <strong style="color:#DC2626">추가 납부</strong>가 일반적입니다.' },
  { q: '단순경비율과 장부 작성, 어느 게 유리한가요?', a: '<strong style="color:var(--text)">실제 경비가 단순경비율보다 크면 장부, 적으면 단순경비율</strong>이 유리합니다. 예: IT 개발자 매출 5천만원 → 단순경비율 64.1%로 3,205만 경비 자동 인정. 실제로 사무실·장비·소프트웨어에 4천만 썼다면 장부 작성이 800만 차이만큼 유리합니다. 다만 장부 작성에는 <strong style="color:var(--text)">증빙(영수증·세금계산서·신용카드)</strong> 보관과 매출·경비 기록 의무가 있습니다. 단순경비율은 <strong style="color:var(--text)">계속사업자 직전년도 수입이 인적용역 3,600만(도소매 6,000만) 미만</strong>일 때 적용되고, 그 이상이면 기준경비율로 전환됩니다. 신규(개업 첫해)는 복식부기 의무 기준(인적용역 7,500만)까지 단순경비율이 가능하며, 그 기준을 넘으면 복식부기 의무로 장부가 필수입니다.' },
  { q: '노란우산공제 vs 연금저축, 뭐가 절세 효과가 큰가요?', a: '<strong style="color:var(--text)">본인 한계세율에 따라 다릅니다.</strong><ul style="margin:8px 0;padding-left:18px"><li><strong>노란우산</strong>은 소득공제 → 한계세율만큼 절세. 한계세율 24%면 200만 납입 시 약 53만 절세(지방세 포함).</li><li><strong>연금저축</strong>은 세액공제 → 종합소득금액 4,500만 이하 16.5%, 초과 13.2% 정액. 600만 납입 시 79~99만 절세.</li></ul>과세표준 5천만 이상(한계세율 24%+)이면 노란우산이, 4,500만 이하 저소득 구간이면 연금저축의 16.5% 정률이 유리합니다. 본 도구의 「시나리오 비교」 탭에서 즉시 확인할 수 있습니다.' },
  { q: '직장인 + 부업 프리랜서, 합산 신고 어떻게 하나요?', a: '근로소득과 사업소득은 <strong style="color:var(--text)">합산되어 종합과세</strong>됩니다. 회사에서 연말정산을 마쳐도 부업 사업소득이 있으면 5월에 종소세 신고 의무가 있습니다. 합산 시 한계세율이 더 높은 구간으로 점프해 <strong style="color:#DC2626">추가 납부</strong>가 발생하는 경우가 흔합니다. 예: 본업 7,000만(24% 구간) + 부업 1,500만 → 합산 8,500만으로 일부는 35% 적용 가능. 본 계산기는 단독 사업소득 기준이므로 겸업자는 본업 근로소득과 합산해 계산해야 정확합니다.' },
  { q: '신고 안 하면 어떻게 되나요?', a: '무신고 시 다음 가산세가 부과됩니다.<ul style="margin:8px 0;padding-left:18px"><li><strong style="color:#DC2626">무신고 가산세 20%</strong>(부정 무신고 40%)</li><li><strong style="color:#DC2626">납부지연 가산세 일 0.025%</strong>(연 약 9.1%)</li><li><strong style="color:#DC2626">무기장 가산세 20%</strong>(복식부기 의무자가 미작성 시)</li></ul>또한 환급 대상이었어도 신고하지 않으면 <strong style="color:var(--text)">환급 받지 못합니다</strong>. 5월 1~31일 신고 의무는 매출 규모와 무관하게 모든 사업소득자에게 적용됩니다.' },
  { q: '종소세 신고하면 건강보험료가 오른다는데?', a: '직장가입자가 아닌 <strong style="color:var(--text)">지역가입자</strong>는 종합과세된 사업소득이 다음 해 11월부터 건보료 산정 기준에 반영됩니다. 매출이 크게 늘어난 해의 다음 해 건보료가 인상되는 패턴입니다. 다만 <strong style="color:var(--text)">경비 처리·공제로 사업소득금액 자체가 줄어들면 건보료도 함께 줄어듭니다</strong>. 종소세 절세가 건보료 절세로 이어지는 효과. 직장가입자는 본업 근로소득 기준이라 부업 사업소득이 일정 기준 미만이면 영향 없습니다.' },
  { q: '장부 작성 의무는 언제부터 생기나요?', a: '업종별 직전년도 매출 기준입니다.<ul style="margin:8px 0;padding-left:18px"><li><strong>간편장부</strong>: 일반(사업 시작 후 누구나 권장)</li><li><strong>복식부기 의무</strong>: 인적용역 7,500만 / 부동산임대 7,500만 / 음식·숙박 1억5천 / 도소매 3억 등</li></ul>복식부기 의무자가 미작성하면 <strong style="color:#DC2626">무기장 가산세 20%</strong>, 단순경비율 적용도 불가합니다. 매출이 위 한도를 넘으면 세무사 또는 회계 프로그램을 통해 복식부기 작성이 일반적입니다.' },
  { q: '수입 1억 넘으면 세무사 써야 하나요?', a: '의무는 아니지만 <strong style="color:var(--text)">실익이 큰 시점</strong>입니다.<ul style="margin:8px 0;padding-left:18px"><li>한계세율 35% 이상 → 절세 1만원이면 세무사 비용 회수가 빠름</li><li>복식부기 의무 → 정확한 장부 + 결산 보고서 필요</li><li>경비 항목별 한도·증빙 요건 복잡 → 누락 시 큰 손실</li><li>사업자등록(개인사업자/법인) 전환 절세 검토 필요</li></ul>매출 1.5억 이상이면 거의 필수입니다. 매출 5천~1억 구간은 본 도구로 자가진단 → 세무사 1회 자문 → 다음 해부터 직접 신고하는 흐름이 일반적입니다.' },
]

export default function FreelanceTaxPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💼 프리랜서 종합소득세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        업종별 단순경비율·8단계 누진세 자동 + <strong style={{ color: 'var(--text)' }}>노란우산·연금 절세 시나리오</strong> 5종 비교.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 종합소득세율 기준" sources={[{"label":"국세청","href":"https://www.nts.go.kr"},{"label":"홈택스","href":"https://hometax.go.kr"}]} />

      <FreelanceTaxClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 누진세율 표 */}
        <section>
          <h2 style={sectionTitle}>종합소득세율 (8단계 누진세율)</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            과세표준 (사업소득금액 − 종합소득공제) 구간별로 6%부터 45%까지 누진 적용됩니다. 본인 한계세율을 알아야 어떤 절세 전략이 효율적인지 판단할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['과세표준', '세율', '누진공제'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1,400만원 이하',         '6%',  '—'],
                  ['1,400만 ~ 5,000만',      '15%', '126만'],
                  ['5,000만 ~ 8,800만',      '24%', '576만'],
                  ['8,800만 ~ 1.5억',        '35%', '1,544만'],
                  ['1.5억 ~ 3억',            '38%', '1,994만'],
                  ['3억 ~ 5억',              '40%', '2,594만'],
                  ['5억 ~ 10억',             '42%', '3,594만'],
                  ['10억 초과',              '45%', '6,594만'],
                ].map(([base, rate, ded], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{base}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{ded}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...faqAnswer, marginTop: '12px', fontSize: '12px' }}>
            ※ 산출세액 = 과세표준 × 세율 − 누진공제. 추가로 <strong style={{ color: 'var(--text)' }}>지방소득세 10%</strong>가 별도 부과됩니다.
          </p>
        </section>

        {/* 2. 단순경비율 30+ 업종 */}
        <section>
          <h2 style={sectionTitle}>업종별 단순경비율 (인기 직군)</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            장부를 작성하지 않은 프리랜서는 국세청이 정한 업종별 단순경비율로 필요경비를 추정 적용받습니다. 아래 한도는 <strong style={{ color: 'var(--text)' }}>계속사업자(직전년도 수입) 기준</strong>이며, <strong style={{ color: 'var(--text)' }}>신규(개업 첫해)는 복식부기 의무 기준(인적용역 7,500만 등)까지</strong> 단순경비율 적용이 가능합니다. 한도를 넘으면 기준경비율로 전환됩니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['업종', '단순경비율', '기준경비율', '한도 매출'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['작가·번역가',          '75.0%', '24.6%', '3,600만'],
                  ['학원·과외 강사',       '60% (학원) / 75% (개인)', '17.6% / 24.6%', '3,600만'],
                  ['IT 개발자·디자이너',   '64.1%', '19.5%', '3,600만'],
                  ['유튜버·BJ·콘텐츠',     '64.1%', '19.5%', '3,600만'],
                  ['음악가·작곡가',        '75.0%', '24.6%', '3,600만'],
                  ['모델·연기자',          '64.1%', '19.5%', '3,600만'],
                  ['미용·메이크업',        '62.0%', '17.0%', '3,600만'],
                  ['배달 라이더·대리',     '79.4%', '27.4%', '3,600만'],
                  ['부동산 중개',          '50.5%', '18.4%', '2,400만'],
                  ['음식점업',             '89.0%', '6.7%',  '3,600만'],
                  ['소매업',               '86.0%', '5.5%',  '6,000만'],
                ].map(([job, simple, base, limit], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{job}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{simple}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{base}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ ...faqAnswer, marginTop: '12px', fontSize: '12px' }}>
            ※ 매년 5월 국세청 단순경비율 고시 갱신. 정확한 본인 업종코드는 홈택스 &gt; 사업소득 신고 화면에서 확인 가능.
          </p>
        </section>

        {/* 3. 공제 항목 정리 — 소득공제 / 세액공제 분리 */}
        <section>
          <h2 style={sectionTitle}>주요 소득공제·세액공제 항목</h2>

          <p style={{ ...dedTitle, color: '#0891B2' }}>소득공제</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={dedTable}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '한도', '효과'].map(h => (<th key={h} style={dedTh}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['본인 인적공제',    '150만',       '한계세율만큼 절세'],
                  ['배우자·부양가족',  '1명당 150만', '한계세율만큼 절세 (1명 22.5만~67.5만)'],
                  ['국민연금·건보료',  '납부액 전액', '한계세율만큼 절세'],
                  ['노란우산공제',     '200~600만',   '한계세율만큼 절세 (소기업·소상공인 전용, 2025 상향)'],
                ].map(([item, lim, effect], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{item}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{lim}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ ...dedTitle, color: '#059669', marginTop: '22px' }}>세액공제</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={dedTable}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '한도', '효과'].map(h => (<th key={h} style={dedTh}>{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['연금저축·IRP',   '600만 + 300만', '13.2% 또는 16.5% 정액 세액공제'],
                  ['기부금',         '소득의 30%',    '15% (1천 초과 30%)'],
                  ['표준세액공제',   '7만원',         '다른 공제 없을 시 자동'],
                  ['자녀세액공제',   '자녀별 차등',   '1자녀 25만 / 2자녀 55만 / 3자녀+ 100만~'],
                ].map(([item, lim, effect], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{item}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{lim}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 style={sectionTitle}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {FAQ_LD.map((f, i) => (
              <details key={i} style={faqDetails}>
                <summary style={faqSummary}>Q{i + 1}. {f.q}</summary>
                <div style={faqAnswerAcc} dangerouslySetInnerHTML={{ __html: f.a }} />
              </details>
            ))}
          </div>
        </section>

        {/* 5. 신고 절차 요약 */}
        <section>
          <h2 style={sectionTitle}>5월 종합소득세 신고 절차 요약</h2>
          <ol style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 2 }}>
            <li><strong style={{ color: 'var(--text)' }}>1~3월</strong>: 거래처에서 지급명세서 발급 (1월 말까지) · 1년 매출/경비 정리</li>
            <li><strong style={{ color: 'var(--text)' }}>4월</strong>: 노란우산·연금저축 납입증명서 수령 · 부양가족 자료 점검</li>
            <li><strong style={{ color: 'var(--text)' }}>5월 1~31일</strong>: 홈택스 종소세 신고 (모두채움 또는 일반신고)</li>
            <li><strong style={{ color: 'var(--text)' }}>5월 31일</strong>: 납부 마감 (추가 납부 시) — 자정까지 인터넷지로</li>
            <li><strong style={{ color: 'var(--text)' }}>6~7월</strong>: 환급액 입력 계좌로 자동 입금</li>
            <li><strong style={{ color: 'var(--text)' }}>11월</strong>: 다음 해 지역 건강보험료 변동 (사업소득 반영)</li>
          </ol>
        </section>

        {/* 6. 관련 도구 */}
        <section>
          <h2 style={sectionTitle}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',      icon: '💴', name: '연봉 실수령액 계산기', desc: '본업 + 부업 합산 시 실수령' },
              { href: '/tools/finance/4-insurance', icon: '🏥', name: '4대보험 계산기',       desc: '국민연금·건강보험 (전액 소득공제)' },
              { href: '/tools/finance/vat',         icon: '🧾', name: '부가세 계산기',         desc: '별개 세금 (분기·반기 신고)' },
              { href: '/tools/finance/severance',   icon: '💼', name: '퇴직금 실수령액 계산기', desc: '퇴직 후 프리랜서 전환 시' },
              { href: '/tools/finance/savings',     icon: '💰', name: '저축액 계산기',         desc: '환급액으로 절세 상품 시뮬' },
            ].map((t, i) => (
              <Link key={i} href={t.href} style={relCard}>
                <div style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
