import type { Metadata } from 'next'
import StockClient from './StockClient'

export const metadata: Metadata = {
  title: '주식 물타기 계산기 — 평단가 낮추기 계산 | Youtil',
  description: '현재 평단가와 보유 수량, 현재 주가, 추가 매수 금액을 입력해 물타기 후 새 평단가와 수익률 변화를 즉시 계산합니다.',
  keywords: ['주식물타기계산기', '평단가계산기', '물타기계산', '주식평균단가', '추가매수계산기', '물타기평단가'],
}

export default function StockPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        📉 주식 물타기 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        추가 매수 후 새 평단가와 수익률 변화를 즉시 계산합니다.
      </p>

      <StockClient />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '40px' }}>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>물타기 계산 방법</h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            물타기(추가 매수)는 주가가 하락했을 때 추가로 매수해 평균 단가를 낮추는 전략입니다. 새 평단가는 다음 공식으로 계산합니다.
          </p>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', fontFamily: 'monospace', fontSize: '14px', color: 'var(--accent)', textAlign: 'center' }}>
            새 평단가 = (기존 평단가 × 기존 수량 + 현재가 × 추가 수량) ÷ 총 수량
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>물타기 예시 시나리오</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>항목</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>물타기 전</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>물타기 후</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['평단가', '50,000원', '46,667원'],
                  ['보유 수량', '100주', '125주'],
                  ['현재 주가', '40,000원', '40,000원'],
                  ['수익률', '-20.00%', '-14.29%'],
                  ['총 투자금', '5,000,000원', '6,000,000원'],
                ].map(([label, before, after], i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{label}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--text)' }}>{before}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>{after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
            ※ 예시: 평단 50,000원 / 100주 보유 시, 현재가 40,000원에 100만 원 추가 매수
          </p>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { q: '물타기는 항상 유리한 전략인가요?', a: '주가가 반등할 경우 손익분기점이 낮아져 빠르게 수익으로 전환될 수 있습니다. 그러나 주가가 계속 하락하면 손실이 더 커지는 리스크가 있습니다. 추가 매수 전에 해당 종목의 펀더멘털을 반드시 검토하세요.' },
              { q: '물타기와 불타기의 차이는 무엇인가요?', a: '물타기는 주가 하락 시 추가 매수해 평단가를 낮추는 전략이고, 불타기는 주가 상승 시 추가 매수해 수익을 극대화하는 전략입니다. 물타기는 방어적, 불타기는 공격적 전략으로 볼 수 있습니다.' },
              { q: '추가 매수 후 손익분기점은 어떻게 계산하나요?', a: '손익분기점은 새 평단가와 동일합니다. 물타기 후 주가가 새 평단가 이상으로 회복되면 수익 구간에 진입합니다. 수수료와 세금을 고려하면 실제 손익분기점은 새 평단가보다 약간 높을 수 있습니다.' },
              { q: '얼마나 추가 매수해야 효과적인가요?', a: '일반적으로 추가 매수 금액이 기존 투자금의 50% 이상이 되어야 평단가 하락 효과가 뚜렷합니다. 다만 한 종목에 과도한 집중은 리스크가 크므로, 총 포트폴리오의 비중을 고려해 매수 금액을 결정하세요.' },
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