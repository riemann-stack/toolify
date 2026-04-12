import type { Metadata } from 'next'
import Link from 'next/link'
import StockClient from './StockClient'

export const metadata: Metadata = {
  title: '주식 물타기 계산기 — 평단가·탈출 상승률 계산 | Youtil',
  description: '현재 평단가와 보유 수량, 현재 주가, 추가 매수 수량을 입력해 물타기 후 새 평단가와 수익률, 본전을 위한 필요 상승률을 계산합니다. 수수료 포함 계산 지원.',
  keywords: ['주식물타기계산기', '평단가계산기', '물타기계산', '주식평균단가', '추가매수계산기', '코스트에버리지', '주식수수료계산'],
}

export default function StockPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📉 주식 물타기 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        추가 매수 후 새 평단가, 수익률 변화, 본전을 위한 필요 상승률을 즉시 계산합니다.
        증권사 수수료를 포함한 정밀 계산도 지원합니다.
      </p>

      <StockClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 평단가 산출 공식 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            물타기 후 평균단가 산출 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            물타기의 핵심은 <strong style={{ color: 'var(--text)' }}>총 투자 금액을 총 보유 수량으로 나누는 것</strong>입니다.
            수수료를 포함할 경우 실제 매수 단가에 수수료율을 반영해야 정확한 손익분기점을 파악할 수 있습니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>새 평균단가 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, letterSpacing: '0.3px' }}>
                새 평단가 = (기존 평단가 × 보유 수량 + 현재가 × 추가 수량)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;÷ (보유 수량 + 추가 수량)
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(62,200,255,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#3EC8FF', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>본전 탈출 필요 상승률</p>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, letterSpacing: '0.3px' }}>
                필요 상승률 = (새 평단가 ÷ 현재가 - 1) × 100%
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                수수료 포함 시: 필요 상승률 = (새 평단가 ÷ (현재가 × (1 - 수수료율)) - 1) × 100%
              </p>
            </div>
          </div>

          {/* 예시 시나리오 */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
              📌 계산 예시 — 평단 50,000원 / 100주 보유 시 현재가 40,000원에 25주 추가 매수
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>항목</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>물타기 전</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>물타기 후</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['평균단가', '50,000원', '48,000원'],
                    ['보유 수량', '100주', '125주'],
                    ['현재 수익률', '-20.0%', '-16.7%'],
                    ['본전 필요 상승률', '+25.0%', '+20.0%'],
                  ].map(([label, before, after], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--muted)' }}>{label}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text)' }}>{before}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── 2. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                q: '코스트 에버리지(Cost Averaging) 효과란 무엇인가요?',
                a: '코스트 에버리지(비용 평균화) 효과란 주가가 하락했을 때 추가 매수해 평균 매입 단가를 낮추는 전략입니다. 정기적으로 일정 금액을 투자하면 주가가 높을 때 적게 사고, 낮을 때 많이 사게 되어 자연스럽게 평단가가 낮아집니다. 단, 주가가 계속 하락하면 손실이 커지므로 해당 종목의 펀더멘털 분석이 선행되어야 합니다.',
              },
              {
                q: '물타기는 항상 유리한 전략인가요?',
                a: '주가가 반등할 경우 손익분기점이 낮아져 빠르게 수익으로 전환될 수 있습니다. 그러나 주가가 계속 하락하면 손실이 더 커지는 리스크가 있습니다. 물타기 전에 하락 원인이 일시적인지(시장 조정, 단기 악재) 아니면 구조적인지(실적 악화, 사업 모델 붕괴)를 반드시 파악하세요.',
              },
              {
                q: '증권사 수수료가 손익분기점에 미치는 영향은?',
                a: '수수료는 매수 시와 매도 시 각각 부과됩니다. 예를 들어 0.015% 수수료라면 매수·매도 합산 0.03%가 됩니다. 단기 트레이딩에서는 무시할 수 없는 비용이며, 특히 물타기처럼 추가 매수를 반복할수록 수수료 누적 비용이 손익분기점을 높입니다. 본 계산기의 수수료 포함 옵션으로 정확한 본전 상승률을 확인하세요.',
              },
              {
                q: '물타기와 불타기의 차이는 무엇인가요?',
                a: '물타기는 주가 하락 시 추가 매수해 평단가를 낮추는 방어적 전략이고, 불타기(피라미딩)는 주가 상승 시 추가 매수해 수익을 극대화하는 공격적 전략입니다. 물타기는 하락장에서 평단 낮추기에 유리하고, 불타기는 추세가 강한 상승장에서 수익을 배가할 수 있습니다.',
              },
              {
                q: '얼마나 추가 매수해야 평단가 하락 효과가 클까요?',
                a: '추가 매수 금액이 기존 투자금 대비 클수록 평단가 하락 효과가 큽니다. 기존 투자금과 동일한 금액을 추가 매수하면(1:1 비율), 새 평단가는 기존 평단가와 현재가의 정확히 중간값이 됩니다. 다만 한 종목에 과도하게 집중하면 포트폴리오 리스크가 커지므로 비중 관리가 중요합니다.',
              },
            ].map((faq, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '8px' }}>Q. {faq.q}</p>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '평단 낮춘 후 장기 보유하면 얼마나 불어날까?' },
              { href: '/tools/finance/salary',   icon: '💴', name: '연봉 실수령액 계산기', desc: '매월 투자 가능한 금액 파악' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '투자 대출 시 이자 비용 확인' },
              { href: '/tools/finance/vat',      icon: '🧾', name: '부가세 계산기',        desc: '사업자 주식 비용 세금 계산' },
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