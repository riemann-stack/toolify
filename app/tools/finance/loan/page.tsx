import Link from 'next/link'
import LoanClient from './LoanClient'
import { buildMetadata } from '@/lib/seo'
import UpdatedMeta from '@/components/UpdatedMeta'
import { GuideDivider } from "@/components/ToolSection"
import Faq from '@/components/Faq'
import Disclaimer from '@/components/Disclaimer'
import { calcEqualPayment } from './loanUtils'
import ToolIconBadge from '@/components/ToolIconBadge'

/* §3 금리별 3억/30년 비교표 — 계산 엔진으로 직접 생성 (정적 수치 드리프트 방지) */
const RATE_TABLE_ROWS = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0].map(rate => {
  const r = calcEqualPayment({ principal: 300_000_000, annualRate: rate, months: 360 })
  return {
    rate: `${rate.toFixed(1)}%`,
    monthly: r.monthlyPayment.toLocaleString('ko-KR') + '원',
    total: r.totalPayment.toLocaleString('ko-KR') + '원',
    interest: r.totalInterest.toLocaleString('ko-KR') + '원',
  }
})

export const metadata = buildMetadata({
  path: '/tools/finance/loan',
  title: '대출이자 계산기 2026 — 원리금균등·원금균등·중도상환·갈아타기·금리변동',
  description:
    '원리금균등·원금균등부터 갈아타기·중도상환·금리 변동까지. 매달 얼마 나갈지 정확히 + 총 이자·DSR·LTV·실효금리 비교. 2026년 한국 시중 금리 기준.',
  keywords: [
    '대출이자계산기', '원리금균등', '원금균등', '주택담보대출계산기',
    '대출상환계산기', '대출이자계산', 'DSR계산기',
    '주담대 계산', '중도상환 계산', '대출 갈아타기',
    '금리 인상 시뮬', '월 상환액 계산', '대출 역산',
    '2026 대출 금리', '주택담보대출 계산', '신용대출 계산',
  ],
})

const FAQ_LD = [
              {
                q: '원금균등과 원리금균등 중 어느 것이 유리한가요?',
                a: '장기적으로는 <strong>원금균등이 총 이자 부담이 적어 유리</strong>합니다. 3억 원을 30년간 연 4% 금리로 빌릴 경우 원금균등이 원리금균등보다 약 3,000만 원 이상 이자를 절약할 수 있습니다. 다만 초기 월 납입액이 높으므로 소득 여유가 있을 때 선택하세요.',
              },
              {
                q: '거치기간(거치식 대출)이란 무엇인가요?',
                a: '거치기간이란 <strong>원금 상환 없이 이자만 납부하는 기간</strong>입니다. 예를 들어 3억 원을 3년 거치 27년 상환으로 빌리면, 처음 3년은 이자만 내고 이후 27년간 원금과 이자를 함께 상환합니다. 초기 부담은 줄지만 전체 이자 비용은 늘어납니다.',
              },
              {
                q: 'DSR(총부채원리금상환비율)이란 무엇인가요?',
                a: 'DSR은 <strong>연간 총 대출 원리금 상환액이 연소득에서 차지하는 비율</strong>입니다. 2026년 현재 은행권은 DSR 40% 규제를 적용해, 연소득 5,000만 원이면 연간 원리금 상환액이 2,000만 원(월 약 167만 원)을 넘으면 대출이 제한됩니다.',
              },
              {
                q: 'LTV(담보인정비율)란 무엇인가요?',
                a: 'LTV는 <strong>담보 자산(부동산) 가치 대비 대출 가능 금액의 비율</strong>입니다. LTV 70%이면 10억 원짜리 아파트에 최대 7억 원까지 대출이 가능합니다. 규제 지역·비규제 지역에 따라 LTV 한도가 다르며, 주택담보대출 한도 계산 시 LTV와 DSR을 동시에 적용합니다.',
              },
              {
                q: '중도상환 시 절약되는 이자는 어떻게 계산하나요?',
                a: '중도상환 시 잔여 원금에 대한 이자가 발생하지 않아 이자를 절약할 수 있습니다. 단 대부분 금융기관은 대출 후 3년 이내 중도상환 시 잔여 원금의 0.5~1.5% 수준의 중도상환수수료가 발생합니다. 3년 이후에는 수수료 없이 중도상환이 가능한 경우가 많습니다. 본 도구의 <strong>[중도상환] 탭</strong>에서 수수료 포함 순절감액을 정확히 계산할 수 있습니다.',
              },
              {
                q: '대출이자 계산기의 결과가 실제와 다를 수 있나요?',
                a: '네, 원 단위 절사·절상, 금융기관별 계산 방식의 미세한 차이로 실제 납입액과 소폭 다를 수 있습니다(±1% 수준). 정확한 상환 계획은 해당 금융기관의 공식 대출 계산기 또는 상담을 통해 확인하시기 바랍니다.',
              },
              {
                q: '중도상환 시 기간 단축 vs 월 상환액 감소 어느 게 유리한가요?',
                a: '일반적으로 <strong>기간 단축 모드가 총 이자 절감 효과가 큽니다.</strong><br>· 기간 단축: 월 상환액 동일, 기간 짧아짐 → 총 이자 ↓↓<br>· 월 상환액 감소: 기간 동일, 매월 부담 ↓ → 총 이자 ↓<br><br>같은 1,000만원 중도상환(3억 / 4% / 30년 / 24개월차) 시 — 기간 단축은 총 이자 약 −1,960만원 (약 1.7년 단축), 월 상환액 감소는 약 −660만원. 소득 안정적이면 기간 단축, 월 부담 줄이고 싶으면 월 상환액 감소를 선택하세요.',
              },
              {
                q: '갈아타기 손익분기는 어떻게 계산하나요?',
                a: '<strong>손익분기 = 부대비용 ÷ 월 절감액</strong>. 예: 잔액 2.5억을 5%→4%(25년)로 갈아타면 월 약 14만원 절감, 부대비용 350만원 → 350 ÷ 14 ≈ 25개월. 25개월 이상 유지 시 이득.<br><br>⚠️ 손익분기 외 추가 고려 — 향후 금리 변동(변동금리 갈아타기 시) / 본인 신용 변화 / 은행 상품 조건(수수료·면제 조건). 본 도구의 <strong>[갈아타기] 탭</strong>에서 자동 계산할 수 있습니다.',
              },
              {
                q: '변동금리 대출에서 금리 인상에 어떻게 대비하나요?',
                a: '본 도구의 <strong>[금리 변동] 탭</strong>으로 다음 확인 권장 — +1.0%p 시 월 부담 증가(감당 가능?) / +2.0%p 시 월 부담 증가(위험 수준?).<br><br>대비 방법 — 비상금 6~12개월치 확보 / 가능 시 고정금리 일부 전환 검토 / 월 부담 25% 이상 인상 시 갈아타기·중도상환 검토.',
              },
              {
                q: '월 100만원씩 갚을 수 있으면 얼마까지 빌릴 수 있나요?',
                a: '본 도구의 <strong>[역산] 탭</strong> 사용. 예: 월 100만원, 4.5%, 30년, 원리금균등 → 약 1억 9,700만원.<br><br>같은 월 100만원이라도 — 금리 1%p 차이 → 가능 원금 약 11~13% 차이 / 기간 10년 → 30년 → 가능 원금 약 2배.<br><br>⚠️ 단, 실제 대출 한도는 신용·소득·DSR·LTV에 따라 결정됩니다.',
              },
              {
                q: '신용대출 vs 주택담보대출 어느 게 유리한가요?',
                a: '일반적으로 <strong>주담대가 금리↓ + 한도↑</strong>로 유리합니다.<br>· 주담대 (담보 있음): 평균 4.3%, 한도 LTV 50~70%<br>· 신용대출 (담보 없음): 평균 5.5%, 한도 연소득 1~2배<br><br>주택 보유자는 주담대 우선 검토 권장. 다만 — 단기(1~3년)는 신용대출이 부대비용 적어 유리할 수 있고, 장기·고액은 주담대가 압도적 유리. 상황에 따라 두 가지 조합(주담대 70% + 신용 30%)도 가능합니다.',
              },
            ]

export default function LoanPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="finance" />대출이자 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        원리금균등·원금균등부터 갈아타기·중도상환·금리 변동까지 — <strong style={{ color: 'var(--text)' }}>매달 얼마 나갈지</strong> 정확하게.
      </p>

      <UpdatedMeta date="2026년 5월" basis="2026년 시중 금리 참고" sources={[{"label":"은행연합회 공시","href":"https://portal.kfb.or.kr"}]} />

      <LoanClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 원리금균등 vs 원금균등 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            대출 상환 방식 비교: 원리금균등 vs 원금균등
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            대출을 받을 때 가장 많이 고민하는 것이 상환 방식 선택입니다.
            <strong style={{ color: 'var(--text)' }}> 원리금균등상환</strong>은 매달 동일한 금액을 납부하는 방식이고,
            <strong style={{ color: 'var(--text)' }}> 원금균등상환</strong>은 매달 동일한 원금에 감소하는 이자를 더해 납부하는 방식입니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>원리금균등 월 납입액 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'nowrap', overflowX: 'auto' }}>
                월 납입액 = 대출원금×[r(1+r)ⁿ]÷[(1+r)ⁿ-1]
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                r = 월 이자율(연 금리 ÷ 12), n = 총 납입 횟수(개월 수)
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '12px', color: '#0891B2', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>원금균등 월 납입액 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'nowrap', overflowX: 'auto' }}>
                월 납입액 = (대출원금÷n)+(잔여원금×r)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                매달 원금은 동일하게 상환하고, 이자는 잔여 원금에 비례해 감소
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>원리금균등</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: '#0891B2', fontWeight: 700 }}>원금균등</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['월 납입액',   '매월 동일',                '초기 높고 매달 감소'],
                  ['총 이자',     '상대적으로 많음',          '상대적으로 적음'],
                  ['초기 부담',   '낮음 (계획 세우기 쉬움)', '높음'],
                  ['이자 절약',   '상대적으로 불리',          '유리 (원금이 빨리 줄어듦)'],
                  ['적합 대상',   '소득 일정한 직장인·주담대', '여유 자금 있는 경우'],
                  ['대출 실행률', '약 80% 이상 선택',         '약 20% 미만 선택'],
                ].map(([label, a, b], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. 한국 시중 금리 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            한국 시중은행 평균 금리 (2026년 5월 기준 추정)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            한국은행 가계대출 통계 기반 시중은행 평균 금리. 계산기의 금리 입력란 기본값(주택담보대출 평균 4.3%)도 이 표를 참고했습니다.
            실제 금리는 신용점수·은행·상품에 따라 차이가 있으니 거래 은행 상담을 권장합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>대출 종류</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>평균</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>최저~최고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['🏠 주택담보대출 (변동)', '4.3%',  '3.8~4.9%'],
                  ['🏠 주택담보대출 (고정)', '4.5%',  '4.0~5.1%'],
                  ['🔑 전세자금대출',         '4.0%',  '3.5~4.6%'],
                  ['💳 신용대출',             '5.5%',  '4.0~8.5%'],
                  ['🚗 자동차 할부',          '5.0%',  '3.5~7.0%'],
                  ['🎓 청년 정책 대출',       '3.5%',  '2.5~4.5%'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 800 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 출처: 한국은행 가계대출 가중평균 금리. 청년 정책 대출은 주택도시기금·청년전세자금 등 정부 지원 상품 기준.
          </p>
        </section>

        {/* ── 3. 금리별 비교표 (기존 유지) ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            금리별 3억 대출 월 납입액 및 총 이자 비교표 (30년)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            대출 원금 3억 원, 30년(360개월) 원리금균등상환 기준으로 금리별 월 납입액과 총 이자를 비교합니다.
            금리가 1%p 오를 때마다 월 납입액은 약 16~18만 원, 총 이자는 약 5,800~6,600만 원 증가합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연 금리</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>원리금균등 월납입</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>총 납입액</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: '#DC2626', fontWeight: 500 }}>총 이자</th>
                </tr>
              </thead>
              <tbody>
                {RATE_TABLE_ROWS.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{row.rate}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 500 }}>{row.monthly}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{row.total}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#DC2626' }}>{row.interest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 원리금균등상환, 30년 만기, 중도상환 없음 기준. 실제 금융기관 적용 수치와 소폭 차이 있을 수 있습니다.
          </p>
        </section>

        {/* ── 4. 중도상환 가이드 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            중도상환 — 언제 얼마 갚아야 유리한가?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            중도상환 효과 — 잔여 원금 ↓ → 이자 ↓. 단, 중도상환수수료가 발생하므로 <strong style={{ color: 'var(--text)' }}>순절감 = 줄어든 이자 − 수수료</strong>로 계산해야 합니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(161,98,7,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#A16207', marginBottom: '6px' }}>✅ 중도상환이 유리한 경우</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none' }}>
                <li>· 3년 이상 지났을 때 (수수료 0%)</li>
                <li>· 금리 높은 시점</li>
                <li>· 여유 자금 + 다른 투자처 수익률 ↓</li>
                <li>· 심리적 부채 부담 큰 경우</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(220,38,38,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#DC2626', marginBottom: '6px' }}>⚠️ 신중해야 할 경우</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none' }}>
                <li>· 3년 이내 + 수수료 1.0~1.5%</li>
                <li>· 다른 투자처 수익률 &gt; 대출 금리</li>
                <li>· 비상금 부족한 상태</li>
                <li>· 다른 고금리 채무 있는 경우 (그쪽 먼저)</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginTop: '12px' }}>
            본 도구의 <strong style={{ color: 'var(--text)' }}>[중도상환] 탭</strong>에서 수수료 포함 순절감액을 정확히 계산할 수 있습니다.
          </p>
        </section>

        {/* ── 5. 갈아타기 손익분기 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            대출 갈아타기 — 손익분기 계산
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>손익분기 = 부대비용 ÷ 월 절감액</strong>. 이 기간 이상 새 대출을 유지해야 갈아타기가 이득입니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.30)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 16, fontWeight: 800, color: '#0891B2', marginBottom: 8 }}>
              📌 예시 — 잔액 2.5억, 5% → 4% 갈아타기 (남은 25년)
            </p>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              <li>월 절감: 약 14만원</li>
              <li>부대비용: 350만원 (중도상환수수료 200 + 취급수수료 100 + 인지·등록 50)</li>
              <li><strong style={{ color: 'var(--text)' }}>손익분기: 350 ÷ 14 ≈ 25개월</strong></li>
              <li>25개월 이상 유지 시 이득. 1년 이내 다시 갈아탈 계획이면 신중 결정.</li>
            </ul>
          </div>
        </section>

        {/* ── 6. 금리 인상 대비 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            금리 인상기 대비 — 변동금리 사용자
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: '14px' }}>
            한국 변동금리는 보통 6개월·1년 주기로 갱신됩니다. 본 도구의 <strong style={{ color: 'var(--text)' }}>[금리 변동] 탭</strong>으로 다음 시나리오 대비를 권장합니다 —
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, listStyle: 'none', padding: 0, margin: 0, marginBottom: '14px' }}>
            <li>· <strong style={{ color: 'var(--text)' }}>+0.5%p</strong> 시 월 부담 (감당 가능?)</li>
            <li>· <strong style={{ color: 'var(--text)' }}>+1.0%p</strong> 시 월 부담 (위험 수준?)</li>
            <li>· <strong style={{ color: 'var(--text)' }}>+2.0%p</strong> 시 월 부담 (급등 시나리오)</li>
          </ul>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)', marginBottom: '6px' }}>💡 대비 방법</p>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
              <li>비상금 6~12개월치 확보</li>
              <li>가능 시 고정금리 일부 전환 검토</li>
              <li>월 부담 25% 이상 인상 시 갈아타기·중도상환 검토</li>
              <li>원금균등 일부 전환으로 잔액 감소 가속</li>
            </ul>
          </div>
        </section>

        {/* ── 7. DSR·LTV 가이드 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            DSR·LTV — 한국 대출 규제 (참고용)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(155,89,182,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#9333EA', marginBottom: '6px' }}>📊 DSR (총부채원리금상환비율)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 6 }}>
                연간 모든 대출 원리금 ÷ 연소득 × 100
              </p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>은행권 한도: <strong style={{ color: 'var(--text)' }}>40%</strong></li>
                <li>2금융권 한도: <strong style={{ color: 'var(--text)' }}>50%</strong></li>
                <li>스트레스 DSR: 변동·혼합금리에 가산금리를 얹어 한도 산정 — 단계별 가산율은 <Link href="/tools/finance/dsr" style={{ color: 'var(--accent)' }}>DSR 계산기</Link> 참고</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(225,29,72,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#E11D48', marginBottom: '6px' }}>🏠 LTV (담보인정비율)</p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginBottom: 6 }}>
                담보 자산 가치 대비 대출 가능 비율
              </p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.85 }}>
                <li>비규제 지역: <strong style={{ color: 'var(--text)' }}>최대 70%</strong></li>
                <li>규제 지역(투기·조정): <strong style={{ color: 'var(--text)' }}>40~50%</strong></li>
                <li>생애최초·신혼 가산 가능</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ⚠️ 본 도구의 DSR 계산은 단순 추정이며, 실제 규제는 상품·만기·정책 변경에 따라 다릅니다. 정확한 한도는 거래 은행·금융감독원 상담을 권장합니다.
          </p>
        </section>

        {/* ── 8. FAQ (accordion + 5개 신규) ── */}
        <section>
          <Faq items={FAQ_LD} />
        </section>

        {/* ── 9. 면책 강화 ── */}
        <section>
          <Disclaimer variant="finance" open>
            본 대출이자 계산기는 <strong>표준 공식 기반 추정 도구</strong>입니다. 금융 자문·승인 도구가 아닙니다.
            <br />
            <strong>본 도구의 한계</strong> — 실제 대출 가능 여부는 신용·소득·LTV·DSR에 따라 다름 / 상환액·이자는 원 단위 절사·절상으로 ±1% 차이 가능 / 중도상환수수료·취급수수료는 은행·상품별 차이 / DSR·LTV 규제는 정책 변경 시 변동 / 변동금리는 기준금리·가산금리 변화 따라 갱신.
            <br />
            정확한 상품·조건은 — 본인 거래 은행 상담 / 한국주택금융공사(HF·주담대) / 한국 금융감독원 e-금융민원센터 <strong>1332</strong> / 채무 상담 한국 신용회복위원회 <strong>1397</strong>.
          </Disclaimer>
        </section>

        {/* ── 함께 쓰면 좋은 도구 ── */}
        <section>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/dsr',      icon: '📊', name: 'DSR 계산기',           desc: '스트레스 DSR 반영 대출 한도 진단' },
              { href: '/tools/finance/salary',   icon: '💰', name: '연봉 실수령액 계산기', desc: '월 납입액 감당 가능한지 소득 확인' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',           desc: '이자 절약분 재투자 시 미래 자산' },
              { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',         desc: '사업자 대출 시 세금 계산' },
              { href: '/tools/unit/area',        icon: '🏠', name: '평수 변환기',     desc: '담보 물건 면적 단위 변환' },
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
