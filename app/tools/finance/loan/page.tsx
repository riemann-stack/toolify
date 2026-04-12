import type { Metadata } from 'next'
import Link from 'next/link'
import LoanClient from './LoanClient'

export const metadata: Metadata = {
  title: '대출이자 계산기 2026 — 원리금균등·원금균등 상환 비교 | Youtil',
  description: '대출 원금, 금리, 기간을 입력해 원리금균등과 원금균등 상환 방식을 비교합니다. 월 납입액·총 이자·상환 스케줄 즉시 계산. DSR·LTV 용어 설명 제공.',
  keywords: ['대출이자계산기', '원리금균등', '원금균등', '주택담보대출계산기', '대출상환계산기', '대출이자계산', 'DSR계산기'],
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

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 대출 상환 방식 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            대출 상환 방식 비교: 원리금균등 vs 원금균등 차이점
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            대출을 받을 때 가장 많이 고민하는 것이 상환 방식 선택입니다.
            <strong style={{ color: 'var(--text)' }}> 원리금균등상환</strong>은 매달 동일한 금액을 납부하는 방식이고,
            <strong style={{ color: 'var(--text)' }}> 원금균등상환</strong>은 매달 동일한 원금에 감소하는 이자를 더해 납부하는 방식입니다.
          </p>

          {/* 핵심 계산 수식 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>원리금균등 월 납입액 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
                월 납입액 = 대출원금 × [r(1+r)ⁿ] ÷ [(1+r)ⁿ - 1]
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                r = 월 이자율(연 금리 ÷ 12), n = 총 납입 횟수(개월 수)
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.2)', borderRadius: '12px', padding: '16px 20px' }}>
              <p style={{ fontSize: '12px', color: '#3EC8FF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>원금균등 월 납입액 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
                월 납입액 = (대출원금 ÷ n) + (잔여원금 × r)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                매달 원금은 동일하게 상환하고, 이자는 잔여 원금에 비례해 감소
              </p>
            </div>
          </div>

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
        </div>

        {/* ── 2. 금리별 비교표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
            금리별 3억 대출 월 납입액 및 총 이자 비교표 (30년)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            대출 원금 3억 원, 30년(360개월) 원리금균등상환 기준으로 금리별 월 납입액과 총 이자를 비교합니다.
            금리가 1%p 오를 때마다 월 납입액은 약 16~18만 원, 총 이자는 약 6,000~7,000만 원 증가합니다.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>연 금리</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>원리금균등 월납입</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>총 납입액</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B', fontWeight: 500 }}>총 이자</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2.5%', '1,185,357원', '426,728,520원', '126,728,520원'],
                  ['3.0%', '1,264,808원', '455,330,880원', '155,330,880원'],
                  ['3.5%', '1,347,047원', '484,936,920원', '184,936,920원'],
                  ['4.0%', '1,432,252원', '515,610,720원', '215,610,720원'],
                  ['4.5%', '1,520,060원', '547,221,600원', '247,221,600원'],
                  ['5.0%', '1,610,465원', '579,767,400원', '279,767,400원'],
                  ['5.5%', '1,703,376원', '613,215,360원', '313,215,360원'],
                  ['6.0%', '1,798,651원', '647,514,360원', '347,514,360원'],
                ].map(([rate, monthly, total, interest], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)', fontWeight: 500 }}>{monthly}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)' }}>{total}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#FF6B6B' }}>{interest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 원리금균등상환, 30년 만기, 중도상환 없음 기준. 실제 금융기관 적용 수치와 소폭 차이 있을 수 있습니다.
          </p>
        </div>

        {/* ── 3. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '원금균등과 원리금균등 중 어느 것이 유리한가요?',
                a: '장기적으로는 원금균등이 총 이자 부담이 적어 유리합니다. 3억 원을 30년간 연 4% 금리로 빌릴 경우 원금균등이 원리금균등보다 약 3,000만 원 이상 이자를 절약할 수 있습니다. 다만 초기 월 납입액이 높으므로 소득 여유가 있을 때 선택하세요.',
              },
              {
                q: '거치기간(거치식 대출)이란 무엇인가요?',
                a: '거치기간이란 원금 상환 없이 이자만 납부하는 기간입니다. 예를 들어 3억 원을 3년 거치 27년 상환으로 빌리면, 처음 3년은 이자만 내고 이후 27년간 원금과 이자를 함께 상환합니다. 초기 부담은 줄지만 전체 이자 비용은 늘어납니다.',
              },
              {
                q: 'DSR(총부채원리금상환비율)이란 무엇인가요?',
                a: 'DSR은 연간 총 대출 원리금 상환액이 연소득에서 차지하는 비율입니다. 2026년 현재 은행권은 DSR 40% 규제를 적용해, 연소득 5,000만 원이면 연간 원리금 상환액이 2,000만 원(월 약 167만 원)을 넘으면 대출이 제한됩니다.',
              },
              {
                q: 'LTV(담보인정비율)란 무엇인가요?',
                a: 'LTV는 담보 자산(부동산) 가치 대비 대출 가능 금액의 비율입니다. LTV 70%이면 10억 원짜리 아파트에 최대 7억 원까지 대출이 가능합니다. 규제 지역·비규제 지역에 따라 LTV 한도가 다르며, 주택담보대출 한도 계산 시 LTV와 DSR을 동시에 적용합니다.',
              },
              {
                q: '중도상환 시 절약되는 이자는 어떻게 계산하나요?',
                a: '중도상환 시 잔여 원금에 대한 이자가 발생하지 않아 이자를 절약할 수 있습니다. 단 대부분 금융기관은 대출 후 3년 이내 중도상환 시 잔여 원금의 0.5~1.5% 수준의 중도상환수수료가 발생합니다. 3년 이후에는 수수료 없이 중도상환이 가능한 경우가 많습니다.',
              },
              {
                q: '대출이자 계산기의 결과가 실제와 다를 수 있나요?',
                a: '네, 원 단위 절사·절상, 금융기관별 계산 방식의 미세한 차이로 실제 납입액과 소폭 다를 수 있습니다. 정확한 상환 계획은 해당 금융기관의 공식 대출 계산기 또는 상담을 통해 확인하시기 바랍니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '월 납입액 감당 가능한지 소득 확인' },
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '이자 절약분을 재투자하면 얼마?' },
              { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',        desc: '사업자 대출 시 세금 계산' },
              { href: '/tools/unit/area',        icon: '🏠', name: '평수 ↔ ㎡ 변환기',    desc: '담보 물건 면적 단위 변환' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg2)', border: '1px solid var(--border)',
                borderRadius: '12px', padding: '14px 16px', textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '3px' }}>{t.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}