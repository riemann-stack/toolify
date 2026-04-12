import type { Metadata } from 'next'
import Link from 'next/link'
import CompoundClient from './CompoundClient'
import CompoundChart from './CompoundChart'

export const metadata: Metadata = {
  title: '복리 계산기 — 투자 수익·72의 법칙 계산 | Youtil',
  description: '원금, 연 수익률, 기간을 입력해 복리 투자 수익을 계산합니다. 거치식·적립식 모두 지원. 72의 법칙, 눈덩이 효과, 실질 수익률(인플레이션) 설명 제공.',
  keywords: ['복리계산기', '복리투자', '투자수익계산기', '적립식복리', '72의법칙', '장기투자계산기', '눈덩이효과', '실질수익률'],
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

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 복리의 마법 + 그래프 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            복리의 마법 — 눈덩이 효과(Snowball Effect)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '12px' }}>
            복리(複利)는 원금에서 발생한 이자가 다시 원금에 합산되어 그 다음 기간의 이자를 계산하는 방식입니다.
            시간이 지날수록 이자가 이자를 낳는 <strong style={{ color: 'var(--text)' }}>「눈덩이 효과(Snowball Effect)」</strong>가 발생합니다.
            처음에는 단리와 큰 차이가 없어 보이지만, 10년이 넘어가면서 그 차이가 기하급수적으로 벌어집니다.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '20px' }}>
            아래 그래프는 1,000만 원을 금리별로 30년간 투자했을 때의 누적 자산을 보여줍니다.
            연 3%와 연 10%의 차이가 30년 후 얼마나 벌어지는지 확인해보세요.
          </p>

          {/* 그래프 */}
          <CompoundChart />
        </div>

        {/* ── 2. 복리 계산 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            복리 계산 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            복리 계산의 핵심 공식은 아래와 같습니다. 적립식의 경우 매월 납입금에 대해 별도로 복리 계산 후 합산합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>거치식 복리 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--text)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                FV = PV × (1 + r)ⁿ
              </p>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <span style={{ color: 'var(--accent)' }}>FV</span> = 미래 가치(Future Value) &nbsp;|&nbsp;
                <span style={{ color: 'var(--accent)' }}>PV</span> = 현재 원금(Present Value)<br />
                <span style={{ color: 'var(--accent)' }}>r</span> = 기간별 수익률(연 수익률 ÷ 12) &nbsp;|&nbsp;
                <span style={{ color: 'var(--accent)' }}>n</span> = 총 기간(월 수)
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#3EC8FF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>적립식 복리 공식 (월 납입)</p>
              <p style={{ fontFamily: 'monospace', fontSize: '15px', color: 'var(--text)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                FV = PMT × [(1 + r)ⁿ - 1] ÷ r
              </p>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.9 }}>
                <span style={{ color: '#3EC8FF' }}>PMT</span> = 매월 납입금(Payment) &nbsp;|&nbsp;
                <span style={{ color: '#3EC8FF' }}>r</span> = 월 이자율(연 수익률 ÷ 12)<br />
                <span style={{ color: '#3EC8FF' }}>n</span> = 총 납입 횟수(월 수)
              </div>
            </div>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.8 }}>
                💡 실제 계산에서는 거치식과 적립식을 합산합니다. 예를 들어 원금 1,000만 원 + 월 10만 원 적립이라면
                두 공식의 결과를 더한 값이 최종 미래 가치입니다.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. 72의 법칙 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            복리의 마법: 원금이 2배가 되는 「72의 법칙」
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            <strong style={{ color: 'var(--text)' }}>72를 연 수익률(%)로 나누면</strong> 원금이 약 2배가 되는 기간(년)을 빠르게 계산할 수 있습니다.
            복잡한 계산 없이 투자 목표를 직관적으로 파악하는 데 유용한 법칙입니다.
          </p>

          {/* 72의 법칙 공식 박스 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.25)', borderRadius: '12px', padding: '18px 20px', textAlign: 'center', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800, color: 'var(--accent)', marginBottom: '6px', letterSpacing: '1px' }}>
              2배 기간 ≈ 72 ÷ 연 수익률(%)
            </p>
            <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
              예시: 연 6% 수익률이면 72 ÷ 6 = <strong style={{ color: 'var(--accent)' }}>12년</strong> 후 원금이 2배
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>연 수익률</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>2배 기간</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>대표 투자처 예시</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>1,000만원 → 30년 후</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2%',  '36년', '저축은행 예금',              '1,811만원'],
                  ['3%',  '24년', '국채·채권',                  '2,427만원'],
                  ['5%',  '14.4년', 'ELS·혼합형 펀드',          '4,322만원'],
                  ['7%',  '10.3년', '주식형 펀드 (장기 평균)',   '7,612만원'],
                  ['10%', '7.2년', 'S&P500 (역사적 평균)',      '17,449만원'],
                  ['15%', '4.8년', '고수익 성장주 (고위험)',     '66,212만원'],
                ].map(([rate, years, example, result], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--accent)', fontWeight: 700 }}>{rate}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--text)', fontWeight: 700 }}>{years}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: 'var(--muted)' }}>{example}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 세금·수수료 미반영, 원금 1,000만 원 거치식 기준. 과거 수익률이 미래를 보장하지 않습니다.
          </p>
        </div>

        {/* ── 4. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '복리와 단리의 차이는 무엇인가요?',
                a: '단리는 원금에만 이자가 붙는 방식이고, 복리는 이자에도 이자가 붙는 방식입니다. 1,000만 원을 연 10% 단리로 10년 투자하면 2,000만 원이지만, 복리로 투자하면 2,594만 원이 됩니다. 장기 투자일수록 두 방식의 차이가 기하급수적으로 커집니다.',
              },
              {
                q: '실질 수익률이란 무엇인가요? (인플레이션)',
                a: '명목 수익률에서 물가 상승률(인플레이션, 약 2~3%)을 빼야 실제 자산의 구매력을 알 수 있습니다. 예를 들어 연 5% 수익을 올렸어도 물가가 3% 올랐다면 실질 수익률은 약 2%에 불과합니다. 장기 투자 계획을 세울 때는 반드시 인플레이션을 고려해야 합니다.',
              },
              {
                q: '월 복리와 연 복리 중 어느 것이 유리한가요?',
                a: '복리 계산 주기가 짧을수록 유리합니다. 연 10% 기준으로 연 복리는 10%이지만, 월 복리의 실질 연수익률은 약 10.47%가 됩니다. 실제 금융상품은 복리 계산 주기(일·월·분기·연)를 확인하는 것이 중요합니다.',
              },
              {
                q: '적립식 투자가 거치식보다 유리한 경우는?',
                a: '시장이 하락과 상승을 반복할 때 매월 일정 금액을 적립하면 평균 매입 단가를 낮출 수 있는 코스트 에버리지(Cost Average) 효과가 있습니다. 목돈이 없어도 시작할 수 있고, 장기적으로 안정적인 수익을 기대할 수 있어 직장인에게 적합합니다.',
              },
              {
                q: '세금은 복리 수익에 어떤 영향을 주나요?',
                a: '국내 금융소득(이자·배당)은 15.4%(소득세 14% + 지방소득세 1.4%)가 과세됩니다. 연간 금융소득이 2,000만 원을 초과하면 종합소득세 과세 대상이 됩니다. 본 계산기는 세전 수익 기준으로 ISA 계좌·연금저축 등 절세 상품을 활용하면 세후 실질 수익을 높일 수 있습니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '매월 얼마를 투자할 수 있는지 확인' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '대출 상환 vs 투자, 어느 쪽이 유리?' },
              { href: '/tools/finance/stock',    icon: '📉', name: '주식 물타기 계산기',   desc: '추가 매수 시 평단가 시뮬레이션' },
              { href: '/tools/health/weightloss',icon: '🎯', name: '목표 체중 감량 계산기', desc: '건강도 복리처럼 꾸준히 관리하세요' },
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
        </div>

      </div>
    </div>
  )
}