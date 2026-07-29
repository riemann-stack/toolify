import Link from 'next/link'
import StockClient from './StockClient'
import { buildMetadata } from '@/lib/seo'
import { GuideDivider } from "@/components/ToolSection"
import FaqJsonLd from '@/components/FaqJsonLd'
import Disclaimer from '@/components/Disclaimer'
import ToolIconBadge from '@/components/ToolIconBadge'
import UpdatedMeta from '@/components/UpdatedMeta'

export const metadata = buildMetadata({
  path: '/tools/finance/stock',
  title: '주식 물타기 계산기 — 평단·역산·분할매수·회복·손절 비교',
  description: '추가 매수 시 평단가가 어디까지 내려갈지 + 회복까지 필요한 상승률 즉시 계산. 단일·분할 매수, 손절 vs 물타기, 미국 주식 환율 반영 원화 손익까지 (양도세는 참고 가이드).',
  keywords: [
    '주식물타기계산기', '평단가계산기', '평단가역산', '분할매수계산기',
    '본전상승률', '주식손절', '코스트에버리지', '미국주식환율계산',
    '서학개미양도세', '종목비중', '주식회복시나리오', '손절vs물타기',
    '추가매수계산기', '주식수수료계산기', '코스피거래세', '나스닥계산기',
  ],
})

const FAQ_LD = [
              {
                q: '코스트 에버리지(Cost Averaging) 효과란 무엇인가요?',
                a: '코스트 에버리지(비용 평균화) 효과란 주가가 하락했을 때 추가 매수해 평균 매입 단가를 낮추는 전략입니다. 정기적으로 일정 금액을 투자하면 주가가 높을 때 적게 사고, 낮을 때 많이 사게 되어 자연스럽게 평단가가 낮아집니다. 단, 주가가 계속 하락하면 손실이 커지므로 해당 종목의 펀더멘털 분석이 선행되어야 합니다.',
              },
              {
                q: '물타기는 항상 유리한 전략인가요?',
                a: '아닙니다. 주가가 반등할 경우 손익분기점이 낮아져 빠르게 수익으로 전환될 수 있지만, 주가가 계속 하락하면 손실이 더 커지는 「떨어지는 칼날(Falling Knife)」 위험이 있습니다. 물타기 전에 하락 원인이 일시적인지(시장 조정, 단기 악재), 구조적인지(실적 악화, 사업 모델 붕괴)를 반드시 파악하세요.',
              },
              {
                q: '증권사 수수료가 손익분기점에 미치는 영향은?',
                a: '수수료는 매수·매도 양쪽에 부과됩니다. 0.015% × 2 + 거래세 0.20% = 약 0.23%가 매매 1회 비용입니다. 단기 트레이딩에서는 무시할 수 없으며, 물타기처럼 추가 매수를 반복할수록 수수료 누적 비용이 본전 상승률을 높입니다. 본 도구의 증권사 선택(한국 8곳)으로 정확한 본전 가격을 확인하세요.',
              },
              {
                q: '물타기와 불타기의 차이는 무엇인가요?',
                a: '물타기는 주가 하락 시 추가 매수해 평단가를 낮추는 방어적 전략이고, 불타기(피라미딩)는 주가 상승 시 추가 매수해 수익을 극대화하는 공격적 전략입니다. 물타기는 하락장에서 평단 낮추기에 유리하고, 불타기는 추세가 강한 상승장에서 수익을 배가할 수 있습니다.',
              },
              {
                q: '얼마나 추가 매수해야 평단가 하락 효과가 클까요?',
                a: '추가 매수 금액이 기존 투자금 대비 클수록 평단가 하락 효과가 큽니다. 기존 투자금과 동일한 금액을 추가 매수하면(1:1) 새 평단가는 기존 평단과 현재가의 정확히 중간값이 됩니다. 다만 한 종목에 과도하게 집중하면 포트폴리오 리스크가 커지므로 비중 관리가 중요합니다 (자산의 10~20% 권장).',
              },
              {
                q: '평단을 X원으로 낮추려면 몇 주 더 사야 하나요?',
                a: '본 도구의 「목표 평단 역산」 탭 사용. 공식: 추가 수량 = 기존 수량 × (기존 평단 − 목표 평단) ÷ (목표 평단 − 현재가). 예: 평단 50,000원 / 100주 / 현재가 40,000원 / 목표 45,000원 → 추가 100주, 약 400만원 필요. ⚠️ 목표 평단이 현재가에 가까울수록 추가 수량이 기하급수적으로 증가합니다.',
              },
              {
                q: '분할 매수는 몇 차로 하는 게 좋나요?',
                a: '현재 손실률에 따라 다릅니다 — 손실 -5% 이내: 단일 매수, -5~-15%: 2차, -15~-30%: 3차, -30~-50%: 5차, -50%+: 손절 강력 검토. 분할 매수의 본질은 「추가 하락에 대비」이므로 하락 가능성이 클수록 차수를 늘립니다. 다만 분할 매수가 손실을 보장하지는 않습니다 — 펀더멘털 우선.',
              },
              {
                q: '손절 vs 물타기 어느 게 유리한가요?',
                a: '본 종목 회복 가능성에 따라 다릅니다. 본 도구의 「손절 vs 물타기」 탭에서 시나리오 비교 가능. 물타기 신호: 펀더멘털 안정, 일시적 시장 조정, 한 종목 10% 이하, 충분한 현금. 손절 신호: 실적 악화·구조적 위기, -50%+ 큰 손실, 한 종목 30%+ 비중. 손절은 손실 인정의 어려움이 있지만, 더 큰 손실 방지·기회 비용 회수의 의미가 있습니다.',
              },
              {
                q: '미국 주식 물타기 시 환율도 고려해야 하나요?',
                a: '네, 매수 환율·현재 환율·양도세 모두 영향. 예: 매수 환율 1,300원에 $100 매수 (13만원), 현재 환율 1,400원에 $90 (12.6만원) → 달러 -10%지만 원화 -3% 손실. 본 도구의 「🇺🇸 미국 주식」 토글은 매수·현재 환율을 반영한 원화 평가액·손익을 계산합니다. 다만 <strong>매도 시 양도세 22%(연 250만 공제)는 계산기에 미반영</strong>이므로 별도로 고려하세요.',
              },
              {
                q: '한 종목에 자산을 얼마나 투자해도 될까요?',
                a: '권장 비중: 10% 이내(안전), 10~20%(주의), 20~30%(집중 위험), 30%+(매우 위험). 물타기를 반복하면 비중이 커지므로 「물타기 계산」 탭의 「종목 비중 점검」으로 4단계 평가를 받아보세요. 인덱스(KOSPI200·S&P500)는 자체 분산이 되어 있어 비중을 더 가져가도 무방합니다.',
              },
              {
                q: '-50% 이상 큰 손실인데 어떻게 해야 하나요?',
                a: '신중한 검토가 필요합니다. 1) 회사 펀더멘털 재점검(실적·재무·산업), 2) 한 종목 비중 확인, 3) 회복 가능성 평가, 4) 가족·전문가 상담. 손절 강력 검토 신호: 실적 악화, 산업 구조적 위기, 사업 모델 붕괴, 회계 부정. 신중 보유 신호: 시장 전체 조정(펀더멘털 안정), 일회성 악재. ⚠️ 큰 손실로 인한 정신적 어려움 시: 한국 정신건강 위기상담 1577-0199, 한국 금융감독원 e-금융민원 1332.',
              },
              {
                q: '본 계산기는 매수·매도를 추천해주나요?',
                a: '아닙니다. 본 도구는 입력값 기반의 수학적 시뮬레이션이며, 매수·매도 추천이나 투자 자문이 아닙니다. 주가 회복은 보장되지 않으며, 물타기는 항상 유리한 전략이 아닙니다. 펀더멘털 분석·산업 동향·본인 투자 성향에 맞춰 본인이 결정해야 합니다. 가입 전 거래 증권사 상담 권장.',
              },
            ]

export default function StockPage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>금융·재테크</p>
      <h1 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        <ToolIconBadge catId="finance" />주식 물타기 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '28px' }}>
        추가 매수 시 평단가가 어디까지 내려갈지 + <strong style={{ color: 'var(--text)' }}>회복까지 필요한 상승률</strong>을 즉시.
      </p>

      <UpdatedMeta
        date="2026년 7월"
        basis="증권거래세율 0.20%(코스피·코스닥, 2026년 금투세 폐지로 환원) · 해외주식 양도소득세 22%(연 250만원 공제) · 증권사 표준 온라인 수수료 반영"
        sources={[
          { label: '국세청', href: 'https://www.nts.go.kr' },
          { label: '국가법령정보센터', href: 'https://www.law.go.kr/LSW/main.html' },
        ]}
      />

      <StockClient />

      <GuideDivider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 평단가 산출 공식 (기존 SEO 보존) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            물타기 후 평균단가 산출 공식
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            물타기의 핵심은 <strong style={{ color: 'var(--text)' }}>총 투자 금액을 총 보유 수량으로 나누는 것</strong>입니다.
            수수료·거래세를 포함할 경우 실제 매수 단가에 수수료율을 반영해야 정확한 손익분기점을 파악할 수 있습니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>새 평균단가 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, letterSpacing: '0.3px' }}>
                새 평단가 = (기존 평단가 × 보유 수량 + 추가 매수가 × 추가 수량)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;÷ (보유 수량 + 추가 수량)
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.2)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#0891B2', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>본전 탈출 필요 상승률 (수수료·거래세 포함)</p>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, letterSpacing: '0.3px' }}>
                본전 가격 = 새 평단가 ÷ (1 − 매수수수료 − 매도수수료 − 거래세 0.20%)<br />
                필요 상승률 = (본전 가격 ÷ 현재가 − 1) × 100%
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(161,98,7,0.20)', borderRadius: '12px', padding: '18px 20px' }}>
              <p style={{ fontSize: '12px', color: '#A16207', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '10px' }}>목표 평단 역산 공식</p>
              <p style={{ fontFamily: 'monospace', fontSize: '14px', color: 'var(--text)', lineHeight: 2, letterSpacing: '0.3px' }}>
                필요 추가 수량 = 보유 수량 × (기존 평단 − 목표 평단) ÷ (목표 평단 − 현재가)
              </p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
                목표 평단이 현재가에 가까울수록 필요 수량이 기하급수적으로 증가
              </p>
            </div>
          </div>

          {/* 예시 시나리오 (기존 보존) */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '10px' }}>
              📌 계산 예시 — 평단 50,000원 / 100주 보유 시 현재가 40,000원에 25주 추가 매수 <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(수수료·세금 제외 단순 예시)</span>
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th scope="col" style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>항목</th>
                    <th scope="col" style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>물타기 전</th>
                    <th scope="col" style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--accent)', fontWeight: 700 }}>물타기 후</th>
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

        {/* ── 2. 물타기 vs 손절 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            ⚖️ 물타기 vs 손절 — 어느 게 유리한가?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            정답은 <strong style={{ color: 'var(--text)' }}>본 종목의 회복 가능성</strong>에 달려 있습니다. 「손절 vs 물타기」 탭에서 시나리오별 손익을 비교할 수 있습니다.
          </p>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '10px' }}>
            가정: 현재 −20% 손실 상태에서 기존 투자금과 동일한 금액을 물타기 또는 대안에 투입, 손익은 총투입 자본 기준.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>시나리오</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>가정</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: '#A16207', fontWeight: 700 }}>1년 후 손익</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['물타기 + 회복',  '본 종목 +20% 회복',  '+8%'],
                  ['손절 + 대안',    '대안 7% 수익 가정',  '-4%'],
                  ['물타기 + 추가하락', '본 종목 −20% 추가하락', '-28%'],
                  ['손절 후 보존',   '대안 0% (현금 보유)', '-10%'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: row[2].startsWith('+') ? '#059669' : '#DC2626', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            <div style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#059669', fontWeight: 700, marginBottom: 8 }}>✅ 물타기 신호</p>
              <ul style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
                <li>회사 펀더멘털 안정·성장</li>
                <li>일시적 시장 조정·분기 일회성 악재</li>
                <li>한 종목 자산의 10% 이하</li>
                <li>충분한 현금 비중·장기 보유 의지</li>
              </ul>
            </div>
            <div style={{ background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.30)', borderRadius: 12, padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#DC2626', fontWeight: 700, marginBottom: 8 }}>❌ 손절 신호</p>
              <ul style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.85, paddingLeft: 16, margin: 0 }}>
                <li>실적 악화·재무 위기</li>
                <li>산업 구조적 위기·사업 모델 붕괴</li>
                <li>한 종목 자산의 30% 이상</li>
                <li>손실률 -50% 이상 + 회복 신호 없음</li>
              </ul>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ※ 회복 가능성을 솔직히 평가하세요. 같은 시간·자금이라도 결정에 따라 1년 후 결과가 최대 약 36%p(+8% vs −28%)까지 달라질 수 있습니다.
          </p>
        </div>

        {/* ── 3. 분할 매수 (DCA) 가이드 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 분할 매수(DCA) — 손실률별 추천 차수
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            「코스트 에버리지(Cost Average)」 효과를 살리려면 한 번에 다 사지 말고, 하락 가능성에 대비해 분할해서 매수합니다.
            본 도구의 「분할 매수」 탭은 차수별 평단·누적 투자금·수익률을 자동 계산합니다.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>현재 손실률</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'center', color: '#0891B2', fontWeight: 700 }}>추천 차수</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>비고</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['-5% 이내',     '1차 (단일)',  '손실 적음 — 분할 불필요'],
                  ['-5 ~ -15%',    '2차 분할',     '소폭 하락 — 절반 진입 + 추가 대기'],
                  ['-15 ~ -30%',   '3차 분할',     '중간 손실 — 표준 권장'],
                  ['-30 ~ -50%',   '5차 분할',     '큰 손실 — 손절 함께 검토'],
                  ['-50% 이상',    '신중한 판단',  '펀더멘털 우선 점검 / 손절 강력 검토'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#0891B2', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)' }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 분할 매수의 본질은 「추가 하락에 대비」이며, 수익을 보장하지 않습니다. 펀더멘털 우선.
          </p>
        </div>

        {/* ── 4. 본전 필요 상승률 — 수수료·세금 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🧾 본전 필요 상승률 — 수수료·거래세 포함 (미국 양도세는 참고)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            진짜 본전은 <strong style={{ color: 'var(--text)' }}>매수 수수료 + 매도 수수료 + 거래세(코스피·코스닥 0.20%)</strong>를 모두 회수해야 합니다.
미국 주식은 추가로 양도소득세 22%(연 250만 공제)도 고려해야 합니다 <span style={{ color: 'var(--muted)' }}>(계산기 미반영 — 별도 고려)</span>.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500 }}>증권사</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>매수 수수료</th>
                  <th scope="col" style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontWeight: 500 }}>매수+매도+거래세</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['키움증권',     '0.015%', '0.23%'],
                  ['삼성증권',     '0.014%', '0.228%'],
                  ['미래에셋',     '0.014%', '0.228%'],
                  ['KB증권',       '0.015%', '0.23%'],
                  ['신한투자',     '0.015%', '0.23%'],
                  ['네이버페이',   '0.0066%', '0.213%'],
                  ['토스증권',     '0.015%', '0.23%'],
                  ['평생 무료 (이벤트)', '0%',     '0.20% (거래세만)'],
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700 }}>{row[0]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--muted)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif' }}>{row[1]}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: 'var(--accent)', fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontWeight: 700 }}>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 8 }}>
            ※ 수수료 표: 2026년 1월 조사 기준 표준 온라인 수수료. 실시간·MTS·HTS 채널별 다를 수 있습니다. 코스피·코스닥 거래세 0.20% (2026년 인상, 금투세 폐지로 환원).
          </p>
        </div>

        {/* ── 5. 종목 비중 관리 (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            📊 종목 비중 관리 — 한 종목에 몰빵해도 될까?
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            물타기를 반복하면 한 종목 비중이 커집니다. 분산 효과가 깨지면 한 종목이 망할 때 자산 전체가 흔들립니다.
            「물타기 계산」 탭에서 총 자산을 입력하면 비중을 4단계로 평가합니다.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {[
              { range: '0~10%',  level: '🟢 안전',       color: '#059669', desc: '한 종목 10% 이내 — 분산 적정' },
              { range: '10~20%', level: '🟡 주의',       color: '#A16207', desc: '약간 집중 — 추가 매수 신중히' },
              { range: '20~30%', level: '🟠 집중 위험',  color: '#EA580C', desc: '집중 위험 — 비중 관리 필요' },
              { range: '30%+',   level: '🔴 매우 위험',  color: '#DC2626', desc: '분산 권장 / 추가 매수 비권장' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: `1px solid ${s.color}55`, borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: s.color, fontWeight: 700, fontFamily: 'Noto Sans KR, sans-serif', marginBottom: 4 }}>
                  {s.level} · {s.range}
                </p>
                <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.7, marginTop: 12 }}>
            ※ 권장 분산: 한 종목 10~15% 이내, 한 섹터 30% 이내. 인덱스(KOSPI200·S&P500)는 자체 분산이 되어 있어 비중을 더 가져가도 됩니다.
          </p>
        </div>

        {/* ── 6. 미국 주식 (서학개미) (NEW) ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
            🇺🇸 미국 주식 (서학개미) — 환율·양도세까지 포함
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.9, marginBottom: '16px' }}>
            미국 주식 본전은 <strong style={{ color: 'var(--text)' }}>달러 가격 회복 + 환율 동일 + 세후</strong>가 모두 충족되어야 합니다.
            「물타기 계산」 탭에서 「🇺🇸 미국 주식」 토글을 켜면 매수 환율·현재 환율 입력 후 원화 평가액·손익을 자동 계산합니다.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(8,145,178,0.20)', borderRadius: '12px', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#0891B2', fontWeight: 700, marginBottom: 6 }}>💱 환율 변동 영향</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                매수 환율 1,300원, $100 매수 → 13만원 / 현재 환율 1,400원, $90 → 12.6만원 (원화 -3% 손실).
                달러로는 -10%지만 원화로는 -3% — 환율이 평가손익을 크게 좌우합니다.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(234,88,12,0.20)', borderRadius: '12px', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#EA580C', fontWeight: 700, marginBottom: 6 }}>🧾 양도소득세 22% (연 250만 공제)</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                해외주식 차익은 연 250만원 초과분에 대해 22% (지방세 포함) 양도소득세 부과.
                예: 1,000만 원 차익 → (1,000 − 250) × 22% = 165만원 세금.
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(155,89,182,0.20)', borderRadius: '12px', padding: '14px 18px' }}>
              <p style={{ fontSize: 13, color: '#9333EA', fontWeight: 700, marginBottom: 6 }}>💸 배당세 15% (미국 원천징수)</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.85 }}>
                미국 주식 배당금은 미국에서 15% 원천징수 후 한국으로 송금됩니다 (한미 조세조약). 배당 재투자 시 세후 금액 기준.
              </p>
            </div>
          </div>
        </div>

        {/* ── 7. FAQ — accordion ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>자주 묻는 질문 (FAQ)</h2>
          <FaqJsonLd items={FAQ_LD} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FAQ_LD.map((faq, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {faq.q}
                </summary>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, marginTop: '10px' }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* ── 8. 면책 ── */}
        <Disclaimer variant="finance" open>
          본 주식 물타기 계산기는 <strong>수학적 시뮬레이션 도구</strong>이며, 투자 자문·매수 권유 도구가 아닙니다.
          <ul style={{ paddingLeft: 18, margin: '6px 0 0' }}>
            <li>물타기는 항상 유리한 전략이 아닙니다</li>
            <li>주가 회복은 보장되지 않습니다 (떨어지는 칼날 위험)</li>
            <li>펀더멘털 악화 종목은 손절이 더 나을 수 있습니다</li>
            <li>한 종목 집중 위험 — 자산의 10~20% 이내 권장</li>
            <li>본인 투자 성향·기간·목적에 맞는 결정 필수</li>
          </ul>
          <p style={{ margin: '8px 0 4px' }}>투자 결정은 본인 책임이며, 다음 도움이 권장됩니다:</p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <li>거래 증권사 고객센터 상담</li>
            <li>한국 금융감독원 e-금융민원: <strong>1332</strong></li>
            <li>가족·신뢰할 수 있는 사람과 상의</li>
            <li>큰 손실로 인한 정신적 어려움 시 — 한국 정신건강 위기상담: <strong>1577-0199</strong></li>
          </ul>
        </Disclaimer>

        {/* ── 9. 함께 쓰면 좋은 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Inter, "Noto Sans KR", system-ui, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>함께 쓰면 좋은 도구</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {[
              { href: '/tools/finance/compound', icon: '📈', name: '복리 계산기',          desc: '평단 낮춘 후 장기 보유하면 얼마나 불어날까?' },
              { href: '/tools/finance/salary',   icon: '💰', name: '연봉 실수령액 계산기', desc: '매월 투자 가능한 금액 파악' },
              { href: '/tools/finance/loan',     icon: '💳', name: '대출이자 계산기',      desc: '투자 대출 시 이자 비용 (신중)' },
              { href: '/tools/finance/dividend', icon: '💰', name: '월배당 자산 계산기',   desc: '배당주 장기 보유 시 월배당 목표' },
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
