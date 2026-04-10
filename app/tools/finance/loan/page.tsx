import type { Metadata } from 'next'
import LoanClient from './LoanClient'

export const metadata: Metadata = {
  title: '대출이자 계산기 2026 — 원리금균등·원금균등 상환 비교 | Youtil',
  description: '대출 원금, 금리, 기간을 입력해 원리금균등과 원금균등 상환 방식을 비교합니다. 월 납입액과 총 이자를 즉시 계산.',
  keywords: ['대출이자계산기', '원리금균등', '원금균등', '주택담보대출계산기', '대출상환계산기', '대출이자계산'],
}

export default function LoanPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💳 대출이자 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        원리금균등과 원금균등 두 상환 방식을 비교해 총 이자와 월 납입액을 계산합니다.
      </p>

      <LoanClient />

      {/* SEO 콘텐츠 */}
      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>원리금균등 vs 원금균등 차이</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            대출 상환 방식은 크게 원리금균등과 원금균등으로 나뉩니다. <strong style={{ color: 'var(--text)' }}>원리금균등상환</strong>은 매달 동일한 금액을 납입하는 방식으로, 초기 납입 부담이 적어 직장인에게 적합합니다. 반면 <strong style={{ color: 'var(--text)' }}>원금균등상환</strong>은 매달 동일한 원금을 상환하므로 초기 납입액이 높지만 갈수록 줄어들고 총 이자 부담이 적습니다.
          </p>

          {/* 비교표 */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>구분</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>원리금균등</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: '#3EC8FF', fontWeight: 700 }}>원금균등</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['월 납입액', '매월 동일', '초기 높고 갈수록 감소'],
                  ['총 이자', '상대적으로 많음', '상대적으로 적음'],
                  ['초기 부담', '낮음', '높음'],
                  ['적합 대상', '소득 일정한 직장인', '소득 여유 있는 경우'],
                  ['주택담보대출', '가장 많이 선택', '이자 절약 원할 때'],
                ].map(([label, a, b], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{a}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)' }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>금리별 3억 대출 월 납입액 비교 (30년)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연 금리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>원리금균등 월납입</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>총 이자 (원리금균등)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['3.0%', '1,264,808원', '155,330,880원'],
                  ['3.5%', '1,347,047원', '184,936,920원'],
                  ['4.0%', '1,432,252원', '215,610,720원'],
                  ['4.5%', '1,520,060원', '247,221,600원'],
                  ['5.0%', '1,610,465원', '279,767,400원'],
                ].map(([rate, payment, interest], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{payment}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B' }}>{interest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '원금균등과 원리금균등 중 어느 것이 유리한가요?',
                a: '장기적으로는 원금균등이 총 이자 부담이 적어 유리합니다. 3억 원을 30년간 연 4% 금리로 빌릴 경우 원금균등이 원리금균등보다 약 3,000만 원 이상 이자를 절약할 수 있습니다. 다만 초기 월 납입액이 높으므로 소득 여유가 있을 때 선택하세요.',
              },
              {
                q: '대출이자 계산기의 계산 결과는 실제와 동일한가요?',
                a: '본 계산기는 원 단위 절사 등 금융기관별 계산 방식의 미세한 차이로 인해 실제 납입액과 소폭 다를 수 있습니다. 정확한 상환 계획은 해당 금융기관에서 확인하시기 바랍니다.',
              },
              {
                q: '중도상환 시 절약되는 이자는 어떻게 계산하나요?',
                a: '중도상환 시 절약 이자는 현재 남은 원금에 잔여 기간의 이자를 계산하면 됩니다. 단, 대부분의 금융기관은 대출 후 3년 이내 중도상환 시 원금의 0.5~1.5% 수준의 중도상환수수료가 발생합니다.',
              },
              {
                q: '변동금리와 고정금리 중 어느 것을 선택해야 하나요?',
                a: '금리 인하가 예상되는 시기에는 변동금리, 금리 인상이 예상되는 시기에는 고정금리가 유리합니다. 2026년 현재 금리 환경에서는 개인 상황에 따라 전문가 상담을 받는 것이 좋습니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>중도상환 수수료 안내</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            대부분의 대출 상품은 일정 기간 내 중도상환 시 수수료가 발생합니다. 주택담보대출의 경우 통상 대출 실행 후 3년 이내에 중도상환하면 잔여 원금의 0.5~1.5% 수수료가 부과됩니다. 3년 이후에는 수수료 없이 중도상환이 가능한 경우가 많으므로, 대출 계약 시 중도상환 조건을 반드시 확인하세요.
          </p>
        </div>

      </div>
    </div>
  )
}