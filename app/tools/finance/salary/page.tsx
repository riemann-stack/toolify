import type { Metadata } from 'next'
import SalaryClient from './SalaryClient'

export const metadata: Metadata = {
  title: '연봉 실수령액 계산기 2026 — 세후 월급 계산 | Toolify',
  description: '2026년 기준 연봉 실수령액 계산기. 국민연금(4.75%), 건강보험(3.595%), 장기요양보험(13.14%), 고용보험(0.9%)을 자동 계산해 세후 월 실수령액을 알려드립니다.',
  keywords: ['연봉실수령액', '연봉계산기2026', '세후연봉', '실수령액계산', '4대보험계산기', '월급실수령액'],
}

export default function SalaryPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        💴 연봉 실수령액 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        2026년 기준 4대보험과 근로소득세를 반영한 세후 월 실수령액을 계산합니다.
      </p>

      <SalaryClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>연봉 실수령액 계산 방법</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            실수령액 = 월급여 − 4대보험 − 근로소득세 − 지방소득세입니다. 4대보험은 국민연금(4.75%), 건강보험(3.595%), 장기요양보험(건강보험료×13.14%), 고용보험(0.9%)으로 구성됩니다.
          </p>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>2026년 달라진 점</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            2026년 국민연금 보험료율이 27년 만에 9.0%에서 9.5%로 인상되어 근로자 부담분이 4.5%→4.75%로 올랐습니다. 건강보험도 7.09%→7.19%로, 장기요양보험도 12.95%→13.14%로 인상되었습니다. 국민연금 기준소득월액 상한도 637만 원으로 상향 조정되었습니다.
          </p>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>계산 시 주의사항</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9 }}>
            본 계산기는 비과세 수당(식대, 교통비 등)을 제외한 순수 급여 기준입니다. 회사별 복리후생, 성과급, 비과세 항목에 따라 실제 수령액과 차이가 있을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}