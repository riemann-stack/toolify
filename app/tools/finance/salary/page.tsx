import type { Metadata } from 'next'
import SalaryClient from './SalaryClient'

export const metadata: Metadata = {
  title: '연봉 실수령액 계산기 2026 — 세후 월급 계산 | Youtil',
  description: '2026년 기준 연봉 실수령액 계산기. 국민연금(4.75%), 건강보험(3.595%), 장기요양보험, 고용보험, 근로소득세 자동 계산.',
  keywords: ['연봉실수령액', '연봉계산기2026', '세후연봉', '실수령액계산', '4대보험계산기', '월급실수령액', '연봉실수령액표'],
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

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>2026년 연봉별 실수령액 표</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            아래 표는 부양가족 1인(본인만) 기준으로 계산한 2026년 연봉 실수령액입니다. 국민연금(4.75%), 건강보험(3.595%), 장기요양보험, 고용보험(0.9%), 근로소득세를 모두 반영했습니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연봉</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>월 총급여</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>월 공제액</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>월 실수령액</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2,400만원', '2,000,000', '278,380',   '1,721,620'],
                  ['3,000만원', '2,500,000', '409,460',   '2,090,540'],
                  ['3,600만원', '3,000,000', '540,550',   '2,459,450'],
                  ['4,200만원', '3,500,000', '715,630',   '2,784,370'],
                  ['4,800만원', '4,000,000', '896,230',   '3,103,770'],
                  ['5,400만원', '4,500,000', '1,076,810', '3,423,190'],
                  ['6,000만원', '5,000,000', '1,317,900', '3,682,100'],
                  ['7,000만원', '5,833,333', '1,719,680', '4,113,653'],
                  ['8,000만원', '6,666,666', '2,107,410', '4,559,256'],
                  ['1억원',     '8,333,333', '2,831,860', '5,501,473'],
                ].map(([salary, gross, deduct, net], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{salary}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{gross}원</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B' }}>{deduct}원</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{net}원</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 부양가족 1인(본인) 기준, 비과세 없는 순수 급여 기준. 실제와 다소 차이가 있을 수 있습니다.
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>2026년 4대보험 요율</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>항목</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>근로자 부담</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>사업주 부담</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>변경사항</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['국민연금',     '4.75%',               '4.75%',  '▲ 4.5% → 4.75% (27년 만의 인상)'],
                  ['건강보험',     '3.595%',              '3.595%', '▲ 3.545% → 3.595%'],
                  ['장기요양보험', '건강보험료 × 13.14%', '동일',   '▲ 12.95% → 13.14%'],
                  ['고용보험',     '0.9%',                '0.9%+α', '동결'],
                ].map(([label, worker, employer, change], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{worker}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{employer}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontSize: '12px' }}>{change}</td>
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
                q: '연봉 실수령액 계산 시 부양가족 수가 중요한 이유는?',
                a: '근로소득세는 부양가족 수에 따라 차등 공제됩니다. 부양가족이 많을수록 소득공제 금액이 커져 납부할 세금이 줄어듭니다. 본인만 있는 경우 1인, 배우자까지 있으면 2인으로 입력하세요.',
              },
              {
                q: '식대, 교통비 등 비과세 수당이 있으면 어떻게 되나요?',
                a: '월 20만 원 이내 식대, 월 20만 원 이내 자가운전보조금 등 비과세 수당은 4대보험과 근로소득세 산정 기준에서 제외됩니다. 비과세 수당이 있으면 실제 공제액이 본 계산기보다 적게 나옵니다.',
              },
              {
                q: '2026년 국민연금이 왜 오른 건가요?',
                a: '국민연금 기금 고갈 문제를 해결하기 위해 정부는 2026년부터 보험료율을 기존 9%에서 9.5%로 인상했습니다. 이는 1998년 이후 27년 만의 인상으로, 2033년까지 단계적으로 13%까지 올릴 계획입니다.',
              },
              {
                q: '연봉 협상 시 세전과 세후 중 어느 기준으로 이야기해야 하나요?',
                a: '대부분의 연봉 계약은 세전(gross) 기준으로 이루어집니다. 하지만 실제 생활비 계획은 세후(net) 실수령액을 기준으로 해야 합니다. 연봉 협상 시 세전 금액을 확인하고 실수령액 계산기로 실제 수령액을 미리 확인해보세요.',
              },
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