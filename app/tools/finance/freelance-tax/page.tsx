import Link from 'next/link'
import FreelanceTaxClient from './FreelanceTaxClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"

export const metadata = buildMetadata({
  path: '/tools/finance/freelance-tax',
  title: '프리랜서 종합소득세 계산기 — 단순경비율 자동 + 공제 시뮬 + 시나리오 비교 (2026년)',
  description:
    '3.3% 원천징수 프리랜서·1인 사업자의 종합소득세 환급액을 30+ 업종 단순경비율 자동, 8단계 누진세율, 인적공제·노란우산·연금저축 종합 반영해 정확히 계산. 5가지 절세 시나리오 비교, 한계세율 시각화, 5월 신고 D-day 가이드까지.',
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
const faqQuestion: React.CSSProperties = {
  fontFamily: 'Noto Sans KR, sans-serif',
  fontSize: '15px',
  fontWeight: 700,
  color: 'var(--text)',
  marginBottom: '8px',
}
const faqAnswer: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--muted)',
  lineHeight: 1.8,
  margin: 0,
}

export default function FreelanceTaxPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💼 프리랜서 종합소득세 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        3.3% 원천징수만 내고 있던 프리랜서·1인 사업자를 위한 종합소득세 정확 계산기. 30+ 업종별 단순경비율 자동 적용, 8단계 누진세율, 노란우산·연금저축 절세 시나리오 5종 비교, 5월 신고 가이드까지 한 번에.
      </p>

      <FreelanceTaxClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* 1. 누진세율 표 */}
        <section>
          <h2 style={sectionTitle}>2026년 종합소득세율 (8단계 누진세율)</h2>
          <p style={{ ...faqAnswer, marginBottom: '14px' }}>
            과세표준 (사업소득금액 − 종합소득공제) 구간별로 6%부터 45%까지 누진 적용됩니다. 본인 한계세율을 알아야 어떤 절세 전략이 효율적인지 판단할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['과세표준', '세율', '누진공제', '예시 (구간 상한)'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['1,400만원 이하',         '6%',  '—',           '84만'],
                  ['1,400만 ~ 5,000만',      '15%', '126만',       '624만'],
                  ['5,000만 ~ 8,800만',      '24%', '576만',       '1,536만'],
                  ['8,800만 ~ 1.5억',        '35%', '1,544만',     '3,706만'],
                  ['1.5억 ~ 3억',            '38%', '1,994만',     '9,406만'],
                  ['3억 ~ 5억',              '40%', '2,594만',     '1억 7,406만'],
                  ['5억 ~ 10억',             '42%', '3,594만',     '3억 8,406만'],
                  ['10억 초과',              '45%', '6,594만',     '—'],
                ].map(([base, rate, ded, ex], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)' }}>{base}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{ded}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Inter, system-ui, sans-serif' }}>{ex}</td>
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
            장부를 작성하지 않은 프리랜서는 국세청이 정한 업종별 단순경비율로 필요경비를 추정 적용받습니다. 직전년도 매출이 한도 이하인 경우에 한해 적용 가능.
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
                  ['작가·번역가',          '75.0%', '24.6%', '7,500만'],
                  ['학원·과외 강사',       '60% (학원) / 75% (개인)', '17.6% / 24.6%', '7,500만'],
                  ['IT 개발자·디자이너',   '64.1%', '19.5%', '7,500만'],
                  ['유튜버·BJ·콘텐츠',     '64.1%', '19.5%', '7,500만'],
                  ['음악가·작곡가',        '75.0%', '24.6%', '7,500만'],
                  ['모델·연기자',          '64.1%', '19.5%', '7,500만'],
                  ['미용·메이크업',        '62.0%', '17.0%', '2,400만'],
                  ['배달 라이더·대리',     '79.4%', '27.4%', '2,400만'],
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

        {/* 3. 공제 항목 정리 */}
        <section>
          <h2 style={sectionTitle}>주요 소득공제·세액공제 항목</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['항목', '구분', '한도', '효과'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['본인 인적공제',    '소득공제', '150만',           '한계세율만큼 절세'],
                  ['배우자·부양가족',  '소득공제', '1명당 150만',     '한계세율만큼 절세 (1명 22.5만~67.5만)'],
                  ['국민연금·건보료',  '소득공제', '납부액 전액',     '한계세율만큼 절세'],
                  ['노란우산공제',     '소득공제', '200~500만',       '한계세율만큼 절세 (소기업·소상공인 전용)'],
                  ['연금저축·IRP',     '세액공제', '600만 + 300만',   '13.2% 또는 16.5% 정액 세액공제'],
                  ['기부금',           '세액공제', '소득의 30%',      '15% (1천 초과 30%)'],
                  ['표준세액공제',     '세액공제', '7만원',           '다른 공제 없을 시 자동'],
                  ['자녀세액공제',     '세액공제', '자녀별 차등',     '1자녀 25만 / 2자녀 55만 / 3자녀+ 100만~'],
                ].map(([item, kind, lim, effect], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{item}</td>
                    <td style={{ padding: '10px 12px', color: kind === '세액공제' ? '#3EFF9B' : '#3EC8FF' }}>{kind}</td>
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
          <h2 style={sectionTitle}>자주 묻는 질문</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <div>
              <p style={faqQuestion}>Q1. 3.3% 원천징수만 내면 되는 거 아닌가요?</p>
              <div style={faqAnswer}>
                아닙니다. 3.3% (소득세 3% + 지방소득세 0.3%)는 <strong style={{ color: 'var(--text)' }}>임시로 미리 낸 세금</strong>일 뿐, 진짜 세금은 매년 5월 종합소득세 신고로 정산합니다. 본인의 실제 세율(6~45% 누진)에 따라 더 받거나 더 내야 합니다.
                <br /><br />
                매출이 적고 경비·공제가 충분하면 <strong style={{ color: '#3EFF9B' }}>환급</strong>, 매출이 크고 한계세율 24% 이상이면 <strong style={{ color: '#FF8C8C' }}>추가 납부</strong>가 일반적입니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q2. 단순경비율과 장부 작성, 어느 게 유리한가요?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>실제 경비가 단순경비율보다 크면 장부, 적으면 단순경비율</strong>이 유리합니다. 예: IT 개발자 매출 5천만원 → 단순경비율 64.1%로 3,205만 경비 자동 인정. 본인이 실제로 사무실·장비·소프트웨어에 4천만 썼다면 장부 작성이 800만 차이만큼 유리.
                <br /><br />
                다만 장부 작성에는 <strong style={{ color: 'var(--text)' }}>증빙(영수증·세금계산서·신용카드)</strong> 보관과 매출/경비 기록 의무가 있습니다. 매출 7,500만(인적용역 기준) 이상이면 단순경비율 적용 자체가 불가능하니 장부가 필수.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q3. 노란우산공제 vs 연금저축, 뭐가 절세 효과가 큰가요?</p>
              <div style={faqAnswer}>
                <strong style={{ color: 'var(--text)' }}>본인 한계세율에 따라 다릅니다.</strong>
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>노란우산</strong>은 <em style={{ color: 'var(--text)', fontStyle: 'normal' }}>소득공제</em> → 한계세율만큼 절세. 한계세율 24%면 200만 납입 → 약 53만 절세 (지방세 포함).</li>
                  <li><strong>연금저축</strong>은 <em style={{ color: 'var(--text)', fontStyle: 'normal' }}>세액공제</em> → 종합소득금액 4,500만 이하 16.5%, 초과 13.2% 정액. 600만 납입 → 79~99만 정액 절세.</li>
                </ul>
                과세표준 5천만 이상(한계세율 24%+)이면 노란우산이, 4,500만 이하 저소득 구간이면 연금저축의 16.5% 정률이 유리합니다. 본 도구의 &quot;시나리오 비교&quot; 탭에서 즉시 확인 가능.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q4. 직장인 + 부업 프리랜서, 합산 신고 어떻게 하나요?</p>
              <div style={faqAnswer}>
                근로소득과 사업소득은 <strong style={{ color: 'var(--text)' }}>합산되어 종합과세</strong>됩니다. 회사에서 연말정산을 마쳐도, 부업 사업소득이 있으면 5월에 종소세 신고 의무가 있습니다.
                <br /><br />
                합산 시 한계세율이 더 높은 구간으로 점프해 <strong style={{ color: '#FF8C8C' }}>추가 납부</strong>가 발생하는 경우가 흔합니다. 예: 본업 7,000만(24% 구간) + 부업 1,500만 → 합산 8,500만으로 24% 구간 경계, 부업 일부는 35% 적용 가능. 본 계산기는 단독 사업소득 기준이므로 겸업자는 본업 근로소득과 합산해 계산해야 정확.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q5. 신고 안 하면 어떻게 되나요?</p>
              <div style={faqAnswer}>
                무신고 시 다음 가산세가 부과됩니다:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong style={{ color: '#FF6B6B' }}>무신고 가산세 20%</strong> (부정 무신고 40%)</li>
                  <li><strong style={{ color: '#FF6B6B' }}>납부지연 가산세 일 0.025%</strong> (연 약 9.1%)</li>
                  <li><strong style={{ color: '#FF6B6B' }}>무기장 가산세 20%</strong> (복식부기 의무자가 미작성 시)</li>
                </ul>
                또한 환급 대상이었어도 신고하지 않으면 <strong style={{ color: 'var(--text)' }}>환급 받지 못합니다</strong>. 5월 1~31일 신고 의무는 매출 규모와 무관하게 모든 사업소득자에게 적용됩니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q6. 종소세 신고하면 건강보험료가 오른다는데?</p>
              <div style={faqAnswer}>
                직장가입자가 아닌 <strong style={{ color: 'var(--text)' }}>지역가입자</strong>의 경우, 종합과세된 사업소득이 다음 해 11월부터 건보료 산정 기준에 반영됩니다. 매출이 크게 늘어난 해의 다음 해 건보료가 인상되는 패턴입니다.
                <br /><br />
                다만 <strong style={{ color: 'var(--text)' }}>경비 처리·공제로 사업소득금액 자체가 줄어들면 건보료도 함께 줄어듭니다</strong>. 종소세 절세 = 건보료 절세로 이어지는 효과. 직장가입자는 본업 근로소득 기준이므로 부업 사업소득이 일정 기준 미만이면 영향 없음.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q7. 장부 작성 의무는 언제부터 생기나요?</p>
              <div style={faqAnswer}>
                업종별 직전년도 매출 기준:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li><strong>간편장부</strong>: 일반 (사업 시작 후 누구나 권장)</li>
                  <li><strong>복식부기 의무</strong>: 인적용역 7,500만 / 부동산임대 7,500만 / 음식·숙박 1억5천 / 도소매 3억 등</li>
                </ul>
                복식부기 의무자가 미작성하면 <strong style={{ color: '#FF6B6B' }}>무기장 가산세 20%</strong>, 단순경비율 적용 불가. 매출이 위 한도를 넘으면 세무사 또는 회계 프로그램(삼쩜삼·자비스 등)을 통해 복식부기 작성이 일반적입니다.
              </div>
            </div>

            <div>
              <p style={faqQuestion}>Q8. 수입 1억 넘으면 세무사 써야 하나요?</p>
              <div style={faqAnswer}>
                의무는 아니지만 <strong style={{ color: 'var(--text)' }}>실익이 큰 시점</strong>입니다:
                <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                  <li>한계세율 35% 이상 → 절세 1만원 = 세무사비용 회수 빠름</li>
                  <li>복식부기 의무 → 정확한 장부 + 결산 보고서 필요</li>
                  <li>경비 항목별 한도·증빙 요건 복잡 → 누락 시 큰 손실</li>
                  <li>사업자등록(개인사업자/법인) 전환 절세 검토 필요</li>
                </ul>
                매출 1.5억 이상이면 거의 필수. 매출 5천~1억 구간은 본 도구로 자가진단 → 세무사 1회 자문 → 다음 해부터 직접 신고 흐름이 일반적입니다.
              </div>
            </div>

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
          <h2 style={sectionTitle}>관련 도구</h2>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 2 }}>
            <li><Link href="/tools/finance/salary" style={{ color: 'var(--accent)' }}>연봉 실수령액 계산기</Link> — 본업 근로소득 + 부업 합산 시 본업 실수령</li>
            <li><Link href="/tools/finance/4-insurance" style={{ color: 'var(--accent)' }}>4대보험 계산기</Link> — 국민연금·건강보험 부담액 (전액 소득공제)</li>
            <li><Link href="/tools/finance/severance" style={{ color: 'var(--accent)' }}>퇴직금 실수령액 계산기</Link> — 퇴직 후 프리랜서 전환 시 종소세 합산</li>
            <li><Link href="/tools/finance/vat" style={{ color: 'var(--accent)' }}>부가세 계산기</Link> — 별개 세금 (분기·반기 신고)</li>
            <li><Link href="/tools/finance/savings" style={{ color: 'var(--accent)' }}>월 저축 계산기</Link> — 환급액으로 노란우산·연금저축 시뮬</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
