import type { Metadata } from 'next'
import CompoundClient from './CompoundClient'

export const metadata: Metadata = {
  title: '복리 계산기 — 투자 수익 및 적립식 복리 계산 | Youtil',
  description: '원금, 연 수익률, 기간을 입력해 복리 투자 수익을 계산합니다. 거치식·적립식 모두 지원. 72의 법칙, 연봉별 투자 시뮬레이션 제공.',
  keywords: ['복리계산기', '복리투자', '투자수익계산기', '적립식복리', '72의법칙', '장기투자계산기'],
}

export default function CompoundPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📈 복리 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        원금과 연 수익률로 복리 투자 수익을 계산합니다. 매월 적립식도 지원합니다.
      </p>

      <CompoundClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>1,000만원 투자 시 수익률별 결과</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연 수익률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>10년 후</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>20년 후</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>30년 후</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['3% (예금)', '1,344만원', '1,806만원', '2,427만원'],
                  ['5% (채권)', '1,629만원', '2,653만원', '4,322만원'],
                  ['7% (혼합)', '1,967만원', '3,870만원', '7,612만원'],
                  ['10% (주식)', '2,594만원', '6,727만원', '17,449만원'],
                  ['15% (고수익)', '4,046만원', '16,367만원', '66,212만원'],
                ].map(([rate, y10, y20, y30], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{y10}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{y20}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{y30}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>72의 법칙 — 원금이 2배가 되는 기간</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            72를 연 수익률(%)로 나누면 원금이 2배가 되는 기간(년)을 간단히 계산할 수 있습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>연 수익률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>2배 되는 기간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>계산식</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2%', '36년', '72 ÷ 2'],
                  ['3%', '24년', '72 ÷ 3'],
                  ['4%', '18년', '72 ÷ 4'],
                  ['6%', '12년', '72 ÷ 6'],
                  ['8%', '9년', '72 ÷ 8'],
                  ['10%', '7.2년', '72 ÷ 10'],
                  ['12%', '6년', '72 ÷ 12'],
                ].map(([rate, years, calc], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>{years}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{calc}</td>
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
              { q: '복리와 단리의 차이는 무엇인가요?', a: '단리는 원금에만 이자가 붙는 방식이고, 복리는 이자에도 이자가 붙는 방식입니다. 1,000만 원을 연 10% 단리로 10년 투자하면 2,000만 원이지만, 복리로 투자하면 2,594만 원이 됩니다. 장기 투자일수록 복리 효과가 커집니다.' },
              { q: '월 복리와 연 복리 중 어느 것이 유리한가요?', a: '복리 계산 주기가 짧을수록 유리합니다. 연 10% 기준으로 연 복리는 10% 수익이지만, 월 복리는 약 10.47%의 실질 수익률이 됩니다. 실제 금융상품은 복리 계산 주기를 확인하는 것이 중요합니다.' },
              { q: '적립식 투자가 거치식보다 유리한 경우는?', a: '시장이 하락과 상승을 반복할 때 매월 일정 금액을 적립하면 평균 매입 단가를 낮출 수 있는 코스트 에버리지 효과가 있습니다. 목돈이 없어도 시작할 수 있고, 장기적으로 안정적인 수익을 기대할 수 있습니다.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}