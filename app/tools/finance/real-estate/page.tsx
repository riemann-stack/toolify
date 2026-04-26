import Link from 'next/link'
import RealEstateClient from './RealEstateClient'
import AdSlot from '@/components/AdSlot'
import { buildMetadata } from '@/lib/seo'

export const metadata = buildMetadata({
  path: '/tools/finance/real-estate',
  title: '부동산 투자 수익률 계산기 — 자기자본 수익률·레버리지 효과',
  description:
    '매입가, 대출, 취득세, 이자, 매도가를 반영해 부동산 투자 세전 수익과 자기자본 수익률(ROE)을 계산합니다. 대출 레버리지 효과, 매도 시나리오 비교, 손익분기 분석.',
  keywords: ['부동산수익률계산기', '아파트투자수익률', 'ROE계산기', '부동산레버리지', '갭투자수익률', '취득세계산기', '부동산시뮬레이션'],
})

export default function RealEstatePage() {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <p style={{ fontSize: '12px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
        금융·재테크
      </p>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, letterSpacing: '-1px', marginBottom: '12px' }}>
        🏘️ 부동산 투자 수익률 계산기
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '40px' }}>
        매입가·대출·취득세·중개수수료·매도가를 한 화면에서 시뮬레이션해 <strong style={{ color: 'var(--text)' }}>자기자본 수익률(ROE)</strong>과 <strong style={{ color: 'var(--text)' }}>레버리지 효과</strong>를 확인하세요. 보수·기준·낙관 매도 시나리오와 손익분기 매도가까지 자동 계산합니다.
      </p>

      <RealEstateClient />

      {/* 본문 광고 — 도구 결과 직후 */}
      <AdSlot position="in-article" minHeight={200} />

      <div style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '40px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

        {/* ── 1. 면책 조항 (강조) ── */}
        <div style={{
          background: 'rgba(255,107,107,0.06)',
          border: '1px solid rgba(255,107,107,0.3)',
          borderRadius: '14px',
          padding: '18px 22px',
          fontSize: '14px',
          color: 'var(--text)',
          lineHeight: 1.85,
        }}>
          <strong style={{ color: '#FF8C8C', fontSize: '14px' }}>⚖️ 투자 결정 전 반드시 읽어주세요</strong>
          <p style={{ marginTop: '10px' }}>
            본 계산기는 부동산 투자 의사결정을 위한 <strong style={{ color: 'var(--text)' }}>참고용 시뮬레이션 도구</strong>입니다.
            실제 거래에서는 양도소득세, 종합부동산세, 재산세, 임대소득세 등 추가 세금이 발생하며 시장 상황에 따라 결과가 크게 달라질 수 있습니다.
            투자 결정 전 반드시 <strong style={{ color: 'var(--text)' }}>세무사·공인중개사와 상담</strong>하시기 바랍니다.
            <strong style={{ color: '#FF8C8C' }}> 본 계산기는 투자 권유가 아닙니다.</strong>
          </p>
        </div>

        {/* ── 2. 핵심 공식 박스 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            핵심 계산 공식
          </h2>
          <div style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', Menlo, monospace",
            fontSize: '13.5px',
            color: 'var(--text)',
            lineHeight: 2.1,
          }}>
            <div><span style={{ color: 'var(--muted)' }}>세전 수익</span> = (매도가 − 매입가) + 임대 수익 − 총 비용</div>
            <div><span style={{ color: 'var(--muted)' }}>자기자본 수익률 (ROE)</span> = 세전 수익 ÷ 자기자본 × 100</div>
            <div><span style={{ color: 'var(--muted)' }}>연환산 수익률</span> = ROE ÷ 보유 개월 × 12</div>
            <div><span style={{ color: 'var(--muted)' }}>레버리지 효과</span> = 대출 사용 ROE ÷ 현금 투자 ROE</div>
            <div><span style={{ color: 'var(--muted)' }}>손익분기 매도가</span> = 매입가 + 총 비용 − 임대 수익</div>
          </div>
        </div>

        {/* ── 3. 한국 취득세 자동 계산 기준 (2024) ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 취득세 자동 계산 기준 (2024년)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', lineHeight: 1.7 }}>
            본 계산기는 아래 기준으로 자동 산정합니다. 농어촌특별세(0.2%)·지방교육세(0.4%)는 별도이며 실제 신고 세액과 차이가 있을 수 있습니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: '#3EFF9B', fontWeight: 700, marginBottom: '8px' }}>1주택자</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
                6억 이하 → <strong style={{ color: 'var(--accent)' }}>1.0%</strong><br/>
                6~9억 → <strong style={{ color: 'var(--accent)' }}>2.0%</strong><br/>
                9억 초과 → <strong style={{ color: 'var(--accent)' }}>3.0%</strong>
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: '#FF8C3E', fontWeight: 700, marginBottom: '8px' }}>다주택자 (조정대상지역)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
                2주택 → <strong style={{ color: '#FF8C3E' }}>8.0%</strong><br/>
                3주택 이상 → <strong style={{ color: '#FF6B6B' }}>12.0%</strong>
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: '#3EC8FF', fontWeight: 700, marginBottom: '8px' }}>비주거 부동산</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
                토지·상가·오피스 → <strong style={{ color: '#3EC8FF' }}>4.0%</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ── 4. 한국 중개수수료 법정 요율표 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            한국 중개수수료 법정 요율 (매매 기준 · 2024년)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: 480 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['매매가 구간', '요율', '한도액'].map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '12px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { range: '5천만 미만',     rate: '0.6%', cap: '25만원' },
                  { range: '5천만 ~ 2억',    rate: '0.5%', cap: '80만원' },
                  { range: '2억 ~ 6억',      rate: '0.4%', cap: '없음' },
                  { range: '6억 ~ 9억',      rate: '0.5%', cap: '없음' },
                  { range: '9억 ~ 12억',     rate: '0.6%', cap: '없음' },
                  { range: '12억 ~ 15억',    rate: '0.7%', cap: '없음' },
                  { range: '15억 이상',      rate: '협의 (최대 0.9%)', cap: '없음' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg2)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 500 }}>{r.range}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{r.rate}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--muted)', fontFamily: 'Syne, sans-serif' }}>{r.cap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.7 }}>
            ※ 매수·매도 양쪽 모두 별도로 부담합니다. 임대차(전·월세)는 별도 요율표가 적용되며 본 계산기는 매매 기준으로 자동 산정합니다.
          </p>
        </div>

        {/* ── 5. 대출 레버리지 효과 가이드 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            🔑 대출 레버리지 효과 완전 가이드
          </h2>
          <div style={{
            background: 'rgba(200,255,62,0.05)',
            border: '1px solid rgba(200,255,62,0.25)',
            borderRadius: '12px',
            padding: '16px 18px',
            marginBottom: '14px',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--text)' }}>레버리지란?</strong> — 타인 자본(대출)을 활용해 자기자본 수익률을 극대화하는 전략입니다.
              부동산은 대출 비중이 크기 때문에 레버리지 효과가 매우 큰 자산이지만, 동시에 가격 하락 시 손실도 함께 확대됩니다.
            </p>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text)', fontWeight: 600, marginBottom: '10px' }}>
            예시 — 매입가 5억, 1년 후 7억 매도, 대출 금리 4.5%
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '14px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: '#3EFF9B', fontWeight: 700, marginBottom: '8px' }}>현금 100% (5억 자기자본)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                수익 2억 − 비용 약 1,000만원 = <strong>1억 9,000만원</strong><br/>
                <span style={{ color: 'var(--muted)' }}>ROE = 1억 9,000 ÷ 5억 = </span><strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>38%</strong>
              </p>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid rgba(200,255,62,0.3)', borderRadius: '12px', padding: '14px 16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginBottom: '8px' }}>대출 70% (자기자본 1억 5,000)</p>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.85 }}>
                수익 2억 − 비용·이자 약 2,800만원 = <strong>1억 7,200만원</strong><br/>
                <span style={{ color: 'var(--muted)' }}>ROE = 1억 7,200 ÷ 1억 5,000 = </span><strong style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif' }}>114.7%</strong>
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255,107,107,0.06)',
            border: '1px solid rgba(255,107,107,0.25)',
            borderRadius: '12px',
            padding: '14px 18px',
          }}>
            <p style={{ fontSize: '13px', color: '#FF8C8C', fontWeight: 700, marginBottom: '8px' }}>⚠️ 위험 측면</p>
            <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.85, paddingLeft: '20px', margin: 0 }}>
              <li>가격 하락 시 손실도 동일한 비율로 확대됩니다.</li>
              <li>매입가 10% 하락 시 자기자본 50% 손실이 가능합니다 (LTV 80% 기준).</li>
              <li>금리 인상 시 이자 부담이 급증해 ROE가 빠르게 잠식됩니다.</li>
              <li>매도 타이밍을 잡지 못하면 이자만 누적되어 손실이 누적됩니다.</li>
            </ul>
          </div>
        </div>

        {/* FAQ 직후 광고 슬롯 */}
        <AdSlot position="between-tools" minHeight={250} />

        {/* ── 6. 갭투자 vs 일반 매수 비교 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            갭투자 vs 일반 매수 + 임대 비교
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #3EC8FF', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', color: '#3EC8FF', fontWeight: 700, marginBottom: '10px' }}>갭투자 (전세 끼고 매수)</p>
              <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.85, paddingLeft: '18px', margin: 0 }}>
                <li>자기자본 = <strong>매입가 − 전세보증금</strong></li>
                <li>보유 기간 동안 임대수익 0</li>
                <li>매매 차익만으로 수익 실현</li>
                <li>전세 만기 시 보증금 반환 의무</li>
                <li>전세가 하락 시 역전세 위험</li>
              </ul>
            </div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderTop: '3px solid #FF8C3E', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '13px', color: '#FF8C3E', fontWeight: 700, marginBottom: '10px' }}>일반 매수 + 임대</p>
              <ul style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.85, paddingLeft: '18px', margin: 0 }}>
                <li>자기자본 = <strong>매입가 − 대출</strong> (또는 전액 현금)</li>
                <li>월세 수익 발생</li>
                <li>대출 이자 부담</li>
                <li>시세 차익 + 임대 수익 이중 구조</li>
                <li>임대소득세·건강보험료 별도 부담</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── 7. FAQ ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            자주 묻는 질문 (FAQ)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              {
                q: '자기자본 수익률(ROE)이란 무엇인가요?',
                a: '자기자본 수익률은 <strong>실제로 투입한 본인 자금 대비 얻은 수익의 비율</strong>입니다. 매입가 5억 부동산을 1억 5천만원 자기자본 + 3억 5천만원 대출로 매수하고 1억 7천만원의 수익을 얻었다면, ROE = 1억 7천 ÷ 1억 5천 ≈ 113%가 됩니다. 같은 수익이라도 자기자본을 적게 쓰면 ROE는 올라가고, 그만큼 위험도 커집니다.',
              },
              {
                q: '본 계산기의 결과는 양도소득세를 반영한 건가요?',
                a: '아닙니다. 본 계산기는 <strong>“세전 수익”</strong> 기준으로 계산하며, 양도소득세는 보유 기간(1년·2년·3년 미만 단기), 1주택 여부, 장기보유특별공제, 비과세 한도 등 매우 복잡한 변수에 따라 크게 달라집니다. 실제 세후 수익을 정확히 알려면 세무사 상담이 필수입니다.',
              },
              {
                q: '손익분기 매도가는 무엇인가요?',
                a: '손익분기 매도가는 모든 비용(취득세·이자·매수·매도 중개수수료·법무비 등)을 회수할 수 있는 <strong>최소 매도 가격</strong>입니다. 이 가격 이하로 매도하면 손실이 발생합니다. 부동산은 거래 비용이 매입가의 5~10%에 달하기 때문에 시세가 그 이상 올라야 비로소 수익이 발생한다는 점을 인지해야 합니다.',
              },
              {
                q: '대출을 많이 받으면 무조건 좋은가요?',
                a: '아닙니다. 대출은 양날의 검입니다. 가격 상승 시 자기자본 수익률이 크게 오르지만, <strong>가격 하락 시 손실도 동일하게 확대</strong>됩니다. 예를 들어 LTV 80% 대출 후 부동산 가격이 20% 하락하면 자기자본은 100% 손실(원금 전액 소실)될 수 있습니다. 본인의 위험 감내력과 현금 흐름을 고려해 LTV를 선택해야 합니다.',
              },
              {
                q: '임대 수익을 포함한 수익률은 어떻게 계산되나요?',
                a: '임대 수익은 <strong>(월세 × 임대 개월) − (공실 손실 + 임대인 부담 관리비)</strong>로 계산되어 세전 수익에 더해집니다. 매매 차익이 0이어도 월세 수익만으로 수익을 낼 수 있는 것이 “수익형 부동산”의 핵심입니다. 다만 임대소득세, 건강보험료(피부양자 자격 상실 위험) 등은 별도로 발생하므로 실제 수령액과 차이가 있습니다.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 14px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
                  Q{i + 1}. {f.q}
                </summary>
                <p
                  style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75, marginTop: '10px' }}
                  dangerouslySetInnerHTML={{ __html: f.a }}
                />
              </details>
            ))}
          </div>
        </div>

        {/* ── 8. 관련 도구 ── */}
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            함께 쓰면 좋은 도구
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {[
              { href: '/tools/finance/loan',        icon: '💳', name: '대출이자 계산기',          desc: '원리금균등·원금균등 상환 계획' },
              { href: '/tools/finance/compound',    icon: '📈', name: '복리 계산기',              desc: '대안 투자 수익 비교 (예금·적금)' },
              { href: '/tools/finance/inheritance', icon: '🏛️', name: '상속·증여세 비교',         desc: '부동산 증여·상속 세액 시뮬레이션' },
              { href: '/tools/finance/dividend',    icon: '💰', name: '월배당 자산 계산기',       desc: '대안 투자 — 배당 ETF 목표 원금' },
              { href: '/tools/finance/car-cost',    icon: '🚗', name: '자동차 유지비 계산기',     desc: '월·연 환산 유지비 분석' },
            ].map((t, i) => (
              <Link
                key={i}
                href={t.href}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: 'var(--bg2)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s',
                }}
              >
                <p style={{ fontSize: '20px', marginBottom: '6px' }}>{t.icon}</p>
                <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{t.name}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
